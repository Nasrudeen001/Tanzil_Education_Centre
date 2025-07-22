# Tanzil Education Centre Website

This repository contains both the main Tanzil Education Centre website and the School Management System.

## Project Structure

- `/app/` - Main website (Next.js application)
- `/schoolmanagementsystem/` - School Management System (separate Next.js application)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or pnpm

### Running the Main Website

1. Navigate to the root directory:
   ```bash
   cd /path/to/TanzilWeb
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running the School Management System

1. Navigate to the school management system directory:
   ```bash
   cd schoolmanagementsystem
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. The school management system will run on [http://localhost:3001](http://localhost:3001)

### Accessing the Portal

1. Start both applications as described above
2. Navigate to the main website at [http://localhost:3000](http://localhost:3000)
3. Click on the "Portal" link in the navigation bar
4. Select your portal type (Admin, Staff, or Student) from the dropdown
5. You will be taken directly to the relevant login page for your portal type

## Portal Access

The portal provides access to three different user types:

- **Admin Portal**: For administrative functions, staff management, and system settings
- **Staff Portal**: For teachers to manage classes, assessments, and student records
- **Student Portal**: For students to access academic records and personal information

## Features

### Main Website
- Responsive design with modern UI
- Program information and application forms
- Photo and video galleries
- Contact information and about pages

### School Management System
- Role-based access control (Admin, Staff, Student)
- Student and staff management
- Fee management
- Class and subject management
- Assessment tools
- Academic records

## Development

Both applications use:
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Shadcn/ui components

## Deployment

For production deployment, you'll need to:
1. Build both applications
2. Configure the school management system to run as a subdirectory or subdomain
3. Update the portal URLs accordingly

## Support

For technical support, contact the IT department at it@tanzil.edu.ke or call +254 726 376 569. 