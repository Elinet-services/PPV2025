import { useRef } from "react";
import { MDBIcon, MDBLoadingManagement } from "mdb-react-ui-kit";

const LoadingSpinner = ({
  className = "",
  height = "120px",
  width = "100%",
  zIndex = "1029",
  style = {},
  label = "",
}) => {
  const parentRef = useRef(null);

  return (
    <div ref={parentRef} className={className} style={{ height, width, zIndex, ...style }}>
      <MDBLoadingManagement
        backdropOpacity={0.1}
        spinnerElement={<MDBIcon className="loading-icon" fas icon="spinner" size="2x" spin />}
        parentRef={parentRef}
      />
      {label ? <span className="visually-hidden">{label}</span> : null}
    </div>
  );
};

export default LoadingSpinner;
