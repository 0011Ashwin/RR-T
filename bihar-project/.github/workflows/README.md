# GitHub Workflows

This directory contains GitHub Actions workflows for automating CI/CD processes for the Bihar Project.

## Workflows

### 1. CI/CD Pipeline (`main.yml`)

This workflow runs on every push to the main/master branch and on pull requests targeting these branches.

**Steps:**
- Checkout code
- Set up Node.js environment
- Install dependencies
- Run type checking
- Run tests
- Build client and server

### 2. Deployment (`deploy.yml`)

This workflow handles deployment to Netlify when changes are pushed to the main/master branch.

**Steps:**
- Checkout code
- Set up Node.js environment
- Install dependencies
- Build the application
- Deploy to Netlify

## Required Secrets

For the deployment workflow to function properly, you need to set up the following secrets in your GitHub repository:

- `NETLIFY_AUTH_TOKEN`: Your Netlify authentication token
- `NETLIFY_SITE_ID`: The ID of your Netlify site

## Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click on "New repository secret"
4. Add the required secrets mentioned above

## Manual Deployment

You can also trigger the deployment workflow manually by:
1. Going to the Actions tab in your GitHub repository
2. Selecting the "Deploy" workflow
3. Clicking on "Run workflow"