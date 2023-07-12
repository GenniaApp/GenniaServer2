import React, { useCallback, useEffect, useRef } from 'react';

interface DialogProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  open: boolean;
  onClose: () => void;
}

function Dialog(props: DialogProps) {
  const {
    title,
    subtitle,
    children,
    open: isOpen,
    onClose: triggerClose,
    ...restProps
  } = props;

  const contentRef = useRef<HTMLDivElement>(null);

  const handleKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        triggerClose();
      }
    },
    [isOpen, triggerClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [handleKeydown]);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const didClickOnContent = contentRef.current?.contains(
        event.target as Node
      );

      if (!didClickOnContent) {
        triggerClose();
      }
    },
    [contentRef, triggerClose]
  );

  if (isOpen) {
    return (
      <div {...restProps} className='Dialog' onClick={handleClick}>
        <div ref={contentRef} className='Dialog__Content'>
          {title}
          {subtitle}
          {children}
        </div>
      </div>
    );
  }

  return null;
}

export default Dialog;
