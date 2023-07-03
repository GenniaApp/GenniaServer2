import React, { useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

function Dialog(props) {
  const {
    className,
    title,
    subtitle,
    children,
    open: isOpen,
    onClose: triggerClose,
    ...restProps
  } = props;

  const contentRef = useRef();

  const handleKeydown = useCallback(
    (event) => {
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
    (event) => {
      const didClickOnContent = contentRef.current.contains(event.target);

      if (!didClickOnContent) {
        triggerClose();
      }
    },
    [triggerClose]
  );

  if (isOpen) {
    return (
      <div
        {...restProps}
        className={classNames('Dialog', className)}
        onClick={handleClick}
      >
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

Dialog.propTypes = {
  className: PropTypes.string,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  children: PropTypes.node,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Dialog;
