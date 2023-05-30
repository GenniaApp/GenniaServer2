import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";


function Button(props) {
  const { className, children, size, variant, ...restProps } = props;

  return (
    <button
      {...restProps}
      type="button"
      className={classNames("Button", className, {
        "Button--small": size === "small",
        "Button--regular": size === "regular",
        "Button--big": size === "big",
        "Button--blank": variant === "blank",
        "Button--primary": variant === "primary",
      })}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  size: PropTypes.oneOf(["small", "regular", "big"]).isRequired,
  variant: PropTypes.oneOf(["blank", "primary"]).isRequired,
};

Button.defaultProps = {
  size: "regular",
  variant: "blank",
};

export default Button;
