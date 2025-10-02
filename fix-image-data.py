#!/usr/bin/env python3
"""
ImageDataFixer - Standardize Firestore image data structure
Fixes the data structure mismatch between sync script output and website expectations
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import sys
import json

def main():
    print("🔧 ImageDataFixer - Standardizing Firestore data structure...")
    
    try:
        # Initialize Firebase Admin SDK
        if not firebase_admin._apps:
            # Try to initialize with default credentials
            try:
                firebase_admin.initialize_app()
                print("✅ Firebase initialized with default credentials")
            except Exception as e:
                print(f"❌ Failed to initialize Firebase: {e}")
                print("Please ensure Firebase credentials are properly configured")
                return
        
        db = firestore.client()
        
        # Get all documents from the galleries collection
        print("📊 Fetching image documents from Firestore...")
        galleries_ref = db.collection('galleries')
        docs = galleries_ref.stream()
        
        processed_count = 0
        fixed_count = 0
        
        for doc in docs:
            processed_count += 1
            doc_data = doc.to_dict()
            doc_id = doc.id
            
            print(f"Processing document {doc_id}...")
            
            # Check what fields need to be fixed
            needs_update = False
            update_data = {}
            
            # 1. Ensure originalName exists
            if 'originalName' not in doc_data or doc_data['originalName'] is None:
                # Try to derive from fileName or use fileName
                if 'fileName' in doc_data:
                    update_data['originalName'] = doc_data['fileName']
                else:
                    update_data['originalName'] = f"image_{doc_id}"
                needs_update = True
                print(f"  ➕ Adding originalName: {update_data['originalName']}")
            
            # 2. Ensure uploadedAt exists and is properly formatted
            if 'uploadedAt' not in doc_data or doc_data['uploadedAt'] is None:
                # Use createdAt if available, otherwise current time
                if 'createdAt' in doc_data:
                    update_data['uploadedAt'] = doc_data['createdAt']
                else:
                    update_data['uploadedAt'] = datetime.now()
                needs_update = True
                print(f"  ➕ Adding uploadedAt: {update_data['uploadedAt']}")
            
            # 3. Ensure storageUrl exists (mapped from url or downloadURL)
            if 'storageUrl' not in doc_data or doc_data['storageUrl'] is None:
                if 'downloadURL' in doc_data:
                    update_data['storageUrl'] = doc_data['downloadURL']
                elif 'url' in doc_data:
                    update_data['storageUrl'] = doc_data['url']
                else:
                    print(f"  ⚠️ No URL found for document {doc_id}")
                    continue
                needs_update = True
                print(f"  ➕ Adding storageUrl: {update_data['storageUrl']}")
            
            # 4. Ensure downloadURL exists for backward compatibility
            if 'downloadURL' not in doc_data or doc_data['downloadURL'] is None:
                if 'storageUrl' in doc_data:
                    update_data['downloadURL'] = doc_data['storageUrl']
                elif 'url' in doc_data:
                    update_data['downloadURL'] = doc_data['url']
                needs_update = True
                print(f"  ➕ Adding downloadURL: {update_data.get('downloadURL', 'N/A')}")
            
            # 5. Ensure standard metadata fields exist
            standard_fields = {
                'fileName': f"image_{doc_id}.jpg",
                'category': 'uncategorized',
                'tags': [],
                'altText': '',
                'description': '',
                'size': 0,
                'width': 0,
                'height': 0
            }
            
            for field, default_value in standard_fields.items():
                if field not in doc_data or doc_data[field] is None:
                    update_data[field] = default_value
                    needs_update = True
                    print(f"  ➕ Adding {field}: {default_value}")
            
            # Update the document if needed
            if needs_update:
                try:
                    galleries_ref.document(doc_id).update(update_data)
                    fixed_count += 1
                    print(f"  ✅ Updated document {doc_id}")
                except Exception as e:
                    print(f"  ❌ Failed to update document {doc_id}: {e}")
            else:
                print(f"  ✅ Document {doc_id} already has correct structure")
        
        print(f"\n🎉 Data standardization complete!")
        print(f"📊 Processed: {processed_count} documents")
        print(f"🔧 Fixed: {fixed_count} documents")
        print(f"✅ Your images should now display properly on the website!")
        
    except Exception as e:
        print(f"❌ Error during data fixing: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()