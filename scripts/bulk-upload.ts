import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Firebase configuration - SECURITY: DO NOT commit real API keys!
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY_HERE", // Replace with your actual API key
  authDomain: "creadevents-437a8.firebaseapp.com",
  projectId: "creadevents-437a8",
  storageBucket: "creadevents-437a8.firebasestorage.app",
  messagingSenderId: "256034995785",
  appId: "1:256034995785:web:813f895fa2a4754de0c998",
  measurementId: "G-0R00HG63S1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const firestore = getFirestore(app);

interface ImageData {
  fileName: string;
  originalName: string;
  category: string;
  subcategory?: string;
  tags: string[];
  uploadedAt: Date;
  updatedAt: Date;
  storageUrl: string;
  metadata: {
    size: number;
    type: string;
  };
  altText: string;
  featured: boolean;
  sortOrder: number;
}

class BulkImageUploader {
  private baseDir: string;
  private uploadedCount = 0;
  private failedCount = 0;
  private totalFiles = 0;

  constructor(baseDirectory: string) {
    this.baseDir = baseDirectory;
  }

  async uploadAllImages() {
    console.log('🚀 Starting bulk image upload...');
    console.log(`📁 Base directory: ${this.baseDir}`);
    
    // Get all image files
    const imageFiles = this.getAllImageFiles();
    this.totalFiles = imageFiles.length;
    
    console.log(`📊 Found ${this.totalFiles} images to upload`);
    console.log('Categories found:', [...new Set(imageFiles.map(f => f.category))]);
    
    // Upload in batches to avoid overwhelming Firebase
    const batchSize = 5;
    for (let i = 0; i < imageFiles.length; i += batchSize) {
      const batch = imageFiles.slice(i, i + batchSize);
      await this.uploadBatch(batch, i + 1);
      
      // Add delay between batches to avoid rate limiting
      if (i + batchSize < imageFiles.length) {
        console.log('⏳ Waiting 2 seconds before next batch...');
        await this.delay(2000);
      }
    }
    
    this.printSummary();
  }

  private getAllImageFiles(): Array<{
    filePath: string;
    fileName: string;
    category: string;
    subcategory?: string;
    size: number;
  }> {
    const imageFiles: Array<{
      filePath: string;
      fileName: string;
      category: string;
      subcategory?: string;
      size: number;
    }> = [];
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    
    // Read all directories in the base folder
    const categories = fs.readdirSync(this.baseDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    categories.forEach(category => {
      const categoryPath = path.join(this.baseDir, category);
      
      try {
        const files = fs.readdirSync(categoryPath, { withFileTypes: true });
        
        files.forEach(file => {
          if (file.isFile()) {
            const ext = path.extname(file.name).toLowerCase();
            if (imageExtensions.includes(ext)) {
              const filePath = path.join(categoryPath, file.name);
              const stats = fs.statSync(filePath);
              
              imageFiles.push({
                filePath,
                fileName: file.name,
                category: category.toLowerCase(),
                size: stats.size
              });
            }
          } else if (file.isDirectory()) {
            // Handle subcategories
            const subcategoryPath = path.join(categoryPath, file.name);
            const subFiles = fs.readdirSync(subcategoryPath, { withFileTypes: true });
            
            subFiles.forEach(subFile => {
              if (subFile.isFile()) {
                const ext = path.extname(subFile.name).toLowerCase();
                if (imageExtensions.includes(ext)) {
                  const filePath = path.join(subcategoryPath, subFile.name);
                  const stats = fs.statSync(filePath);
                  
                  imageFiles.push({
                    filePath,
                    fileName: subFile.name,
                    category: category.toLowerCase(),
                    subcategory: file.name.toLowerCase(),
                    size: stats.size
                  });
                }
              }
            });
          }
        });
      } catch (error) {
        console.error(`❌ Error reading category ${category}:`, error);
      }
    });
    
    return imageFiles;
  }

  private async uploadBatch(batch: Array<{
    filePath: string;
    fileName: string;
    category: string;
    subcategory?: string;
    size: number;
  }>, startIndex: number) {
    console.log(`📦 Processing batch ${Math.ceil(startIndex / 5)} - Images ${startIndex} to ${startIndex + batch.length - 1}`);
    
    const uploadPromises = batch.map(file => this.uploadSingleImage(file));
    const results = await Promise.allSettled(uploadPromises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.uploadedCount++;
        console.log(`✅ [${this.uploadedCount}/${this.totalFiles}] ${batch[index].fileName}`);
      } else {
        this.failedCount++;
        console.error(`❌ [${this.uploadedCount + this.failedCount}/${this.totalFiles}] ${batch[index].fileName}:`, result.reason);
      }
    });
  }

  private async uploadSingleImage(file: {
    filePath: string;
    fileName: string;
    category: string;
    subcategory?: string;
    size: number;
  }): Promise<void> {
    try {
      // Read file
      const fileBuffer = fs.readFileSync(file.filePath);
      const fileExtension = path.extname(file.fileName);
      const mimeType = this.getMimeType(fileExtension);
      
      // Create unique filename
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${file.fileName}`;
      
      // Upload to Firebase Storage
      const storagePath = `gallery/${file.category}/${uniqueFileName}`;
      const storageRef = ref(storage, storagePath);
      
      const uploadResult = await uploadBytes(storageRef, fileBuffer, {
        contentType: mimeType
      });
      
      // Get download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      // Generate tags based on filename and category
      const tags = this.generateTags(file.fileName, file.category, file.subcategory);
      
      // Create metadata document
      const imageData: Omit<ImageData, 'id'> = {
        fileName: uniqueFileName,
        originalName: file.fileName,
        category: file.category,
        subcategory: file.subcategory,
        tags,
        uploadedAt: new Date(),
        updatedAt: new Date(),
        storageUrl: downloadURL,
        metadata: {
          size: file.size,
          type: mimeType
        },
        altText: `${file.category} ${file.subcategory || ''} image - ${file.fileName}`.trim(),
        featured: false,
        sortOrder: timestamp
      };
      
      // Save to Firestore
      await addDoc(collection(firestore, 'gallery_images'), imageData);
      
    } catch (error) {
      throw new Error(`Failed to upload ${file.fileName}: ${error}`);
    }
  }

  private getMimeType(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif'
    };
    
    return mimeTypes[extension.toLowerCase()] || 'image/jpeg';
  }

  private generateTags(fileName: string, category: string, subcategory?: string): string[] {
    const tags: string[] = [];
    
    // Add category as tag
    tags.push(category);
    
    // Add subcategory as tag
    if (subcategory) {
      tags.push(subcategory);
    }
    
    // Extract tags from filename
    const nameWithoutExt = path.basename(fileName, path.extname(fileName)).toLowerCase();
    
    // Common keywords to extract
    const keywords = [
      'wedding', 'bouquet', 'centerpiece', 'decoration', 'floral', 'arrangement',
      'outdoor', 'indoor', 'ceremony', 'reception', 'bridal', 'elegant',
      'romantic', 'modern', 'vintage', 'rustic', 'boho', 'minimalist',
      'colorful', 'white', 'pink', 'red', 'yellow', 'purple', 'blue',
      'large', 'small', 'table', 'arch', 'backdrop'
    ];
    
    keywords.forEach(keyword => {
      if (nameWithoutExt.includes(keyword)) {
        tags.push(keyword);
      }
    });
    
    // Remove duplicates and return
    return [...new Set(tags)];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private printSummary() {
    console.log('\n🎉 Bulk upload completed!');
    console.log(`✅ Successfully uploaded: ${this.uploadedCount} images`);
    console.log(`❌ Failed uploads: ${this.failedCount} images`);
    console.log(`📊 Total processed: ${this.uploadedCount + this.failedCount}/${this.totalFiles}`);
    
    if (this.failedCount > 0) {
      console.log('\n⚠️  Some uploads failed. Check the error messages above.');
      console.log('You can run the script again to retry failed uploads.');
    } else {
      console.log('\n🎊 All images uploaded successfully!');
      console.log('Your images are now available in Firebase Storage and the admin interface.');
    }
  }
}

// Main execution
async function main() {
  // Update this path to your categorized_images folder
  const baseDirectory = 'C:\\Users\\xsanc\\Documents\\7.creadevents.com\\categorized_images';
  
  // Check if directory exists
  if (!fs.existsSync(baseDirectory)) {
    console.error(`❌ Directory not found: ${baseDirectory}`);
    console.log('Please update the baseDirectory path in the script to point to your categorized_images folder.');
    process.exit(1);
  }
  
  const uploader = new BulkImageUploader(baseDirectory);
  
  try {
    await uploader.uploadAllImages();
  } catch (error) {
    console.error('❌ Fatal error during upload:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { BulkImageUploader };