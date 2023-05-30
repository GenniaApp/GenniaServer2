import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import Dialog from "./Dialog";
import DialogButtons from "./DialogButtons";
import Button from "./Button";

function SurrenderDialog(props) {
  const { onSurrender: handleSurrender, ...restProps } = props;
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleKeydown = useCallback(
    (event) => {
      if (event.key === "Escape" && !isOpen) {
        setIsOpen(true);
      }
    },
    [isOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [handleKeydown]);

  return (
    <Dialog
      {...restProps}
      open={isOpen}
      onClose={handleClose}
      title="Are you sure you want to surrender?"
    >
      <DialogButtons>
        <Button variant="primary" onClick={handleSurrender}>
          Surrender
        </Button>
      </DialogButtons>
    </Dialog>
  );
}

SurrenderDialog.propTypes = {
  onSurrender: PropTypes.func,
};

export default SurrenderDialog;
