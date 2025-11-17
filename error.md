Application bundle generation failed. [7.737 seconds] - 2025-11-17T14:47:52.298Z

X [ERROR] NG5002: Parser Error: Missing closing parentheses at column 7 in [ (new Date()).getFullYear() ] in C:/Users/xsanc/Documents/5.Projects xsantcastx/3.creadevents.com/creadevents/src/app/core/components/footer/footer.component.ts@90:27 [plugin angular-compiler]

    src/app/core/components/footer/footer.component.ts:91:27:
      91 │ ...p class="m-0">© {{ (new Date()).getFullYear() }} {{ siteName }...
         ╵                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG5002: Parser Error: Unexpected token ')' at column 13 in [ (new Date()).getFullYear() ] in C:/Users/xsanc/Documents/5.Projects xsantcastx/3.creadevents.com/creadevents/src/app/core/components/footer/footer.component.ts@90:27 [plugin angular-compiler]

    src/app/core/components/footer/footer.component.ts:91:27:
      91 │ ...p class="m-0">© {{ (new Date()).getFullYear() }} {{ siteName }...
         ╵                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'new' does not exist on type 'FooterComponent'. [plugin angular-compiler]

    src/app/core/components/footer/footer.component.ts:91:31:
      91 │           <p class="m-0">© {{ (new Date()).getFullYear() }} {{ si...
         ╵                               ~~~


X [ERROR] TS2729: Property 'brandConfig' is used before its initialization. [plugin angular-compiler]

    src/app/core/components/footer/footer.component.ts:107:18:
      107 │   siteName = this.brandConfig.siteName;
          ╵                   ~~~~~~~~~~~

  'brandConfig' is declared here.

    src/app/core/components/footer/footer.component.ts:130:10:
      130 │   private brandConfig = inject(BrandConfigService);
          ╵           ~~~~~~~~~~~


X [ERROR] TS2729: Property 'brandConfig' is used before its initialization. [plugin angular-compiler]

    src/app/core/components/footer/footer.component.ts:108:19:
      108 │   brandLogo = this.brandConfig.site.brand.logo;
          ╵                    ~~~~~~~~~~~

  'brandConfig' is declared here.

    src/app/core/components/footer/footer.component.ts:130:10:
      130 │   private brandConfig = inject(BrandConfigService);
          ╵           ~~~~~~~~~~~


X [ERROR] TS2729: Property 'brandConfig' is used before its initialization. [plugin angular-compiler]

    src/app/core/components/footer/footer.component.ts:109:22:
      109 │   contactEmail = this.brandConfig.site.contact.email;
          ╵                       ~~~~~~~~~~~

  'brandConfig' is declared here.

    src/app/core/components/footer/footer.component.ts:130:10:
      130 │   private brandConfig = inject(BrandConfigService);
          ╵           ~~~~~~~~~~~


X [ERROR] TS2729: Property 'brandConfig' is used before its initialization. [plugin angular-compiler]

    src/app/core/components/footer/footer.component.ts:110:22:
      110 │   contactPhone = this.brandConfig.site.contact.phone || '';
          ╵                       ~~~~~~~~~~~

  'brandConfig' is declared here.

    src/app/core/components/footer/footer.component.ts:130:10:
      130 │   private brandConfig = inject(BrandConfigService);
          ╵           ~~~~~~~~~~~


X [ERROR] TS2729: Property 'brandConfig' is used before its initialization. [plugin angular-compiler]

    src/app/core/components/footer/footer.component.ts:111:24:
      111 │   contactAddress = this.brandConfig.site.contact.address || '';
          ╵                         ~~~~~~~~~~~

  'brandConfig' is declared here.

    src/app/core/components/footer/footer.component.ts:130:10:
      130 │   private brandConfig = inject(BrandConfigService);
          ╵           ~~~~~~~~~~~


Watch mode enabled. Watching for file changes...