import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';

const patternImages = [
  '/assets/img/bg-image.png',
  '/assets/img/bg-image3.png',
  '/assets/img/bg-image4.png',
  '/assets/img/bg-image5.png',
  '/assets/img/bg-image6.png',
  '/assets/img/bg-image7.png',
  '/assets/img/bg-image8.png',
  '/assets/img/ng-image1.png',
  '/assets/img/ng-image3.png',
  '/assets/img/shankh.png',
];

// Seeded random number generator for stable rotation values
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface PatternItem {
  src: string;
  top: number;
  left: number;
  size: number;
  rotation: number;
}

interface Rect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

// Collision detection helper
function overlaps(candidate: Rect, rects: Rect[]): boolean {
  return rects.some(r => 
    candidate.left < r.right && candidate.right > r.left &&
    candidate.top < r.bottom && candidate.bottom > r.top
  );
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const BackgroundPattern: React.FC = () => {
  const [patternItems, setPatternItems] = useState<PatternItem[]>([]);

  const calculatePositions = useCallback(() => {
    const items: PatternItem[] = [];
    const seedBase = 12345;
    
    // Get content layer bounding boxes
    const allContentEls = Array.from(document.querySelectorAll('.content-layer'));
    // Filter to only leaf-level content (exclude wrappers that contain other content-layer elements)
    const leafContentEls = allContentEls.filter(el => 
      !allContentEls.some(other => other !== el && el.contains(other))
    );
    const contentRects = leafContentEls.map(el => el.getBoundingClientRect());
    
    // Safety fallback: log warning if no content detected
    if (contentRects.length === 0) {
      console.warn('BackgroundPattern: content detection may be misconfigured - no content-layer elements found');
    }
    
    // Add padding buffer around content (reduced for large elements like hero)
    const paddedRects: Rect[] = contentRects.map(r => {
      const isLarge = r.height > 300 || r.width > 800;
      const pad = isLarge ? 8 : 20;
      return {
        top: r.top - pad,
        bottom: r.bottom + pad,
        left: r.left - pad,
        right: r.right + pad,
      };
    });
    
    // Get page dimensions
    const pageHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );
    const pageWidth = document.documentElement.clientWidth;
    
    // Track placed images for spacing
    const placedImageRects: Rect[] = [];
    const minImageDistance = 120; // Minimum distance between images
    const maxImages = Math.floor(pageHeight / 400); // roughly 1 image per 400px of page height
    const cappedMaxImages = Math.min(maxImages, 60); // hard upper limit for performance
    const maxCandidatesPerImage = 60;
    
    let imageIndex = 0;
    let attempts = 0;
    const maxTotalAttempts = cappedMaxImages * maxCandidatesPerImage;
    
    // Try to place images until we reach max count or exhaust attempts
    while (placedImageRects.length < cappedMaxImages && attempts < maxTotalAttempts) {
      const src = patternImages[imageIndex % patternImages.length];
      imageIndex++;
      
      // Random size: 150-350px
      const size = 150 + seededRandom(seedBase + imageIndex) * 200;
      
      // Try up to 30 random positions for this image
      let placed = false;
      for (let candidate = 0; candidate < maxCandidatesPerImage; candidate++) {
        attempts++;
        
        // Random position within page bounds
        const top = Math.random() * (pageHeight - size);
        const left = Math.random() * (pageWidth - size);
        
        const candidateRect: Rect = {
          top,
          bottom: top + size,
          left,
          right: left + size,
        };
        
        // Check collision with content
        if (overlaps(candidateRect, paddedRects)) {
          continue;
        }
        
        // Check collision with already placed images (with minimum distance)
        const expandedCandidate: Rect = {
          top: candidateRect.top - minImageDistance,
          bottom: candidateRect.bottom + minImageDistance,
          left: candidateRect.left - minImageDistance,
          right: candidateRect.right + minImageDistance,
        };
        
        if (overlaps(expandedCandidate, placedImageRects)) {
          continue;
        }
        
        // Valid position found
        const rotation = (seededRandom(seedBase + imageIndex + candidate) - 0.5) * 30;
        
        items.push({
          src,
          top: (top / pageHeight) * 100,
          left: (left / pageWidth) * 100,
          size,
          rotation,
        });
        
        placedImageRects.push(candidateRect);
        placed = true;
        break;
      }
      
      // If we couldn't place this image after 60 tries, skip it and continue
      if (!placed) {
        continue;
      }
    }
    
    // Guaranteed placement: ensure at least 3 images in first two viewport-heights
    const viewportHeight = window.innerHeight;
    const firstTwoScreensHeight = viewportHeight * 2;
    const imagesInFirstTwoScreens = items.filter(item => item.top < (firstTwoScreensHeight / pageHeight) * 100).length;
    
    if (imagesInFirstTwoScreens < 3) {
      let additionalAttempts = 0;
      const maxAdditionalAttempts = 40;
      
      while (imagesInFirstTwoScreens + additionalAttempts < 3 && additionalAttempts < maxAdditionalAttempts) {
        const src = patternImages[imageIndex % patternImages.length];
        imageIndex++;
        
        const size = 150 + seededRandom(seedBase + imageIndex) * 200;
        
        // Restrict top candidates to first two screens
        const top = Math.random() * (firstTwoScreensHeight - size);
        const left = Math.random() * (pageWidth - size);
        
        const candidateRect: Rect = {
          top,
          bottom: top + size,
          left,
          right: left + size,
        };
        
        // Check collision with content
        if (overlaps(candidateRect, paddedRects)) {
          additionalAttempts++;
          continue;
        }
        
        // Check collision with already placed images
        const expandedCandidate: Rect = {
          top: candidateRect.top - minImageDistance,
          bottom: candidateRect.bottom + minImageDistance,
          left: candidateRect.left - minImageDistance,
          right: candidateRect.right + minImageDistance,
        };
        
        if (overlaps(expandedCandidate, placedImageRects)) {
          additionalAttempts++;
          continue;
        }
        
        // Valid position found
        const rotation = (seededRandom(seedBase + imageIndex + additionalAttempts) - 0.5) * 30;
        
        items.push({
          src,
          top: (top / pageHeight) * 100,
          left: (left / pageWidth) * 100,
          size,
          rotation,
        });
        
        placedImageRects.push(candidateRect);
        additionalAttempts++;
      }
    }
    
    setPatternItems(items);
  }, []);

  useLayoutEffect(() => {
    calculatePositions();
    // Rerun after content settles (images/fonts may shift height)
    const timeout = setTimeout(() => calculatePositions(), 300);
    return () => clearTimeout(timeout);
  }, [calculatePositions]);

  useEffect(() => {
    const handleResize = debounce(() => calculatePositions(), 200);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculatePositions]);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-x-visible overflow-y-hidden">
      {patternItems.map((item, index) => (
        <img
          key={index}
          src={item.src}
          alt=""
          className="absolute opacity-50"
          style={{
            top: `${item.top}%`,
            left: `${item.left}%`,
            width: `${item.size}px`,
            height: `${item.size}px`,
            transform: `rotate(${item.rotation}deg)`,
            objectFit: 'contain',
          }}
          loading="lazy"
        />
      ))}
    </div>
  );
};

export default BackgroundPattern;
