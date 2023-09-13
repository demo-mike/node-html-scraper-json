# Demo Engineering Web Scraper

This project is a collection of scripts that scrape product data from online stores. It fetches product pages, extracts product data, and saves the data to JSON files.
The scripts use Node.js and various helper functions to perform tasks such as fetching HTML content, parsing HTML, and writing data to files.

## About this Repo

This repository contains a collection of scripts designed to scrape product data from online stores. The main goal of this project is to provide an automated way to extract valuable product information such as product details, images, variant links and colors, and navigation links.

The importance of this project lies in its ability to simplify and automate the process of data extraction from online stores. Manually extracting such data can be time-consuming, lack details or volume and error-prone. This project provides a reliable and efficient solution to this problem, saving time and ensuring accuracy of the extracted bulk data.

|                |                                                                                                                                                                         |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current status | The project is currently in the prototype phase. For more details, please refer to the [project roadmap](https://github.com/orgs/Shopify/projects/7636/views/1).        |
| Owner          | This project is maintained by [Demo Engineering](link-to-your-profile). For more information, please join our [Workplace Group](https://work.me/g/4v3ihOJ2s/gPXR67MF).  |
| Help           | For help or to ask questions, please refer to our [Help Center](link-to-help-center). You can also find useful resources in our [Documentation](link-to-documentation). |

## Features

- Fetches product pages from an online store and saves the HTML to a directory.
- Extracts product data from the saved HTML files.
- Saves the extracted product data to a JSON file.
- Handles pagination when fetching products.
- Extracts product images and color swatches.
- Extracts variant links and colors.
- Extracts navigation links.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Shopify/de-web-scrape-tools
```

2. Navigate to the project directory:

```bash
cd de-web-scrape-tools
```

3. Install the dependencies:

```bash
pnpm install
```

## Usage

1. Set up your environment variables in a `.env` file:

```env
SHOPIFY_STORE=your_shopify_store_url
X_SHOPIFY_ACCESS_TOKEN=your_shopify_access_token
```

## Scripts

- `scrapeProducts.js`: Fetches product pages and saves the HTML to a directory.
- `provisionStore.js`: Creates products in a Shopify store from data-extract dir.
- `generateCollections.js`: Created collections from product tags found in a Shopify store

## Contributing

Pull requests are welcome. please open an issue first to discuss what you would like to change.
Refer to [Writing Strong Pull Requests](https://vault.shopify.io/page/Writing-Strong-Pull-Requests~8209.md)
