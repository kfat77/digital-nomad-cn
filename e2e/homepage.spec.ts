import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page).toHaveTitle(/Digital Nomad/);
  });

  test('should have navigation', async ({ page }) => {
    await page.goto('/index.html');
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should have main content', async ({ page }) => {
    await page.goto('/index.html');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/index.html');
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
    await page.goto('/country/index.html');
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('should load specific country page', async ({ page }) => {
    await page.goto('/country/thailand/index.html');
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });
});

test.describe('SEO & Meta', () => {
  test('should have lang attribute', async ({ page }) => {
    await page.goto('/index.html');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'zh-CN');
  });

  test('should have meta description', async ({ page }) => {
    await page.goto('/index.html');
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);
  });
});

test.describe('Performance', () => {
  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(10000); // 10 seconds
  });
});
