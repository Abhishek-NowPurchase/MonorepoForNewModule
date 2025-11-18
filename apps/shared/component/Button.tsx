import React, { forwardRef } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'tertiary' | 'icon' | 'text';
export type ButtonDirection = 'ltr' | 'rtl' | 'top-to-bottom' | 'bottom-to-top';
export type ButtonWeight = 'light' | 'normal' | 'semi-bold' | 'bold';
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning';

export type IconType =
  | 'refresh'
  | 'filter'
  | 'print'
  | 'warning'
  | 'right-arrow'
  | 'left-arrow'
  | 'down-arrow'
  | 'add'
  | 'cancel'
  | 'duplicate'
  | 'edit'
  | 'alert'
  | 'info'
  | 'download'
  | 'check'
  | 'calculator'
  | 'calender'
  | 'dropdown-indicator'
  | 'setting'
  | 'upload'
  | 'history'
  | 'update'
  | 'phone'
  | 'grid'
  | 'list'
  | 'delete';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  icon?: IconType;
  direction?: ButtonDirection;
  weight?: ButtonWeight;
  text?: React.ReactNode;
  active?: boolean;
  hasIcon?: boolean;
  loading?: boolean;
  loader?: React.ReactNode;
  colorVariant?: ColorVariant;
  fullWidth?: boolean;
}

const iconMap: Record<IconType, string> = {
  refresh: 'ri-refresh-line',
  filter: 'ri-equalizer-line',
  print: 'ri-printer-line',
  warning: 'ri-error-warning-line',
  'right-arrow': 'ri-arrow-right-line',
  'left-arrow': 'ri-arrow-left-line',
  'down-arrow': 'ri-arrow-down-line',
  add: 'ri-add-line',
  cancel: 'ri-close-line',
  duplicate: 'ri-file-copy-line',
  edit: 'ri-edit-line',
  alert: 'ri-alert-line',
  info: 'ri-information-line',
  download: 'ri-file-download-line',
  check: 'ri-check-line',
  calculator: 'ri-calculator-line',
  calender: 'ri-calendar-2-line',
  'dropdown-indicator': 'ri-arrow-down-s-line',
  setting: 'ri-settings-3-fill',
  upload: 'ri-upload-line',
  history: 'ri-history-line',
  update: 'ri-save-line',
  phone: 'ri-phone-line',
  grid: 'ri-layout-grid-line',
  list: 'ri-list-view',
  delete: 'ri-delete-bin-line',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      icon,
      text = '',
      variant = 'primary',
      className = '',
      direction = 'ltr',
      weight = 'normal',
      active = false,
      hasIcon = false,
      loading = false,
      loader,
      colorVariant,
      fullWidth = false,
      style,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Map the icon prop to a Remix icon class
    const getIconClass = () => {
      return icon ? iconMap[icon] || '' : '';
    };

    // Map fontWeight to actual pixel value
    const fontWeightClass = weight ? `font-weight-${weight}` : '';

    // Map IconClass
    const iconClass = icon || hasIcon ? 'btn-with-icon' : '';

    const mergedStyle = {
      ...(style || {}),
      ...(fullWidth && { width: '100%' }),
    };

    const buttonClasses = [
      'btn',
      `dir-${direction}`,
      iconClass,
      `aui-btn-${variant}`,
      fontWeightClass,
      className,
      loading ? 'loading' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        data-variant={variant}
        data-active={active}
        data-color-variant={colorVariant}
        aria-busy={loading}
        style={mergedStyle}
        disabled={props.disabled}
        className={buttonClasses}
        type={type}
        {...props}
      >
        {loading ? (
          <>
            {loader || <span className="default-loader" />}
            {children || text}
          </>
        ) : (
          <>
            {icon && <i className={getIconClass()} />}
            {children || text}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

