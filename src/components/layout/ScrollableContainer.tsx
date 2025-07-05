import React, { forwardRef, ReactNode } from 'react';

interface ScrollableContainerProps {
  children: ReactNode;
}

const ScrollableContainer = forwardRef<HTMLDivElement, ScrollableContainerProps>(
  function ScrollableContainer({ children }, ref) {
    return (
      <div style={{ position: 'relative', blockSize: '100%' }}>
        <div
          style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}
          ref={ref}
          data-testid="chat-scroll-container"
        >
          {children}
        </div>
      </div>
    );
  }
);

export default ScrollableContainer;