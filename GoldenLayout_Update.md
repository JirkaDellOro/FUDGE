# GoldenLayout Update
1. `git clone https://github.com/golden-layout/golden-layout.git`
2. Install all npm packages with `npm i`
3. Build the project with `npm run build`
4. Build the bundles with `npm run build:bundles`
5. Copy the UMD-Bundle and the index.d.ts into the FUDGE folder GoldenLayout (FUDGE/Editor/GoldenLayout)
6. If necessary copy also the `goldenlayout-base.css` 
This should be avoided because this file needs some modifications. 
7. Rename the index.d.ts to golden-layout.d.ts
8. Remove all exports in the golden-layout.ts file (search and replace)
9. Check the links in the `index.html` file (UMD and css files)
