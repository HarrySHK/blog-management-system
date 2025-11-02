import { useEffect, useRef } from 'react';

const InfiniteScroll = ({ onLoadMore, hasMore, loading, children }) => {
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, onLoadMore]);

  return (
    <>
      {children}
      <div ref={observerTarget} style={{ height: '20px', marginTop: '20px' }}>
        {loading && hasMore && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ display: 'inline-block', padding: '10px 20px', background: '#f0f0f0', borderRadius: '5px' }}>
              Loading more posts...
            </div>
          </div>
        )}
        {!hasMore && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            No more posts to load
          </div>
        )}
      </div>
    </>
  );
};

export default InfiniteScroll;

