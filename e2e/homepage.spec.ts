import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/Digital Nomad/);
  });

  test('should have navigation', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should have main content', async ({ page }) => {
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('nav')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('nav')).toBeVisible();
  });
});

test.describe('Country Pages', () => {
  test('should load country list page', async ({ page }) => {
    await page.goto('/country/');
    
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('should load specific country page', async ({ page }) => {
    await page.goto('/country/thailand/');
    
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });
});

test.describe('SEO & Meta', () => {
  test('should have lang attribute', async ({ page }) => {
    await page.goto('/');
    
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'zh-CN');
  });

  test('should have meta description', async ({ page }) => {
    await page.goto('/');
    
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);
  });
});

test.describe('Performance', () => {
  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(10000); // 10 seconds
  });
});
