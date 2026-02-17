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
    <div ref={parentRef} className={className} style={{ position: "relative", height, width, zIndex, ...style }}>
      <MDBLoadingManagement
        backdropOpacity={0.1}
        spinnerElement={<MDBIcon className="loading-icon" fas icon="spinner" size="2x" spin />}
        parentRef={parentRef}
      />
      {label ? (
        <div className="loading-label" role="status" aria-live="polite">
          {label}
        </div>
      ) : null}
    </div>
  );
};

export default LoadingSpinner;
