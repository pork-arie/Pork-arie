import { useRef, Children, cloneElement } from 'react';
import { Parallax, ParallaxLayer } from '@react-spring/parallax';

/**
 * A reusable parallax container that wraps children into scrollable layers.
 * 
 * @param {number} pages - Total number of pages (sections)
 * @param {React.ReactNode} children - Each child becomes a separate parallax layer
 * @param {number} speed - Default speed for all layers (optional, default 0.5)
 * @param {function} onScrollTo - Optional callback when scrolling to a page
 */
function ParallaxContainer({ pages, children, speed = 0.5, onScrollTo }) {
  const ref = useRef(null);

  // Map each child to a ParallaxLayer with offset = its index
  const layers = Children.map(children, (child, index) => (
    <ParallaxLayer
      key={index}
      offset={index}
      speed={speed}
      onClick={() => {
        // Scroll to next page on click (optional)
        if (index < pages - 1 && ref.current) {
          ref.current.scrollTo(index + 1);
          onScrollTo && onScrollTo(index + 1);
        }
      }}
    >
      {child}
    </ParallaxLayer>
  ));

  return (
    <Parallax ref={ref} pages={pages}>
      {layers}
    </Parallax>
  );
}

export default ParallaxContainer;