import React, { ButtonHTMLAttributes } from 'react';
import classNames from 'classnames';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  size?: 'small' | 'regular' | 'big';
  variant?: 'blank' | 'primary';
}

function Button({
  className,
  children,
  size = 'regular',
  variant = 'blank',
  ...restProps
}: ButtonProps) {
  return (
    <button
      {...restProps}
      type='button'
      className={classNames('Button', className, {
        'Button--small': size === 'small',
        'Button--regular': size === 'regular',
        'Button--big': size === 'big',
        'Button--blank': variant === 'blank',
        'Button--primary': variant === 'primary',
      })}
    >
      {children}
    </button>
  );
}

export default Button;
