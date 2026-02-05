import { useMemo, useState } from "react";
import { MDBInput, MDBListGroup, MDBListGroupItem } from "mdb-react-ui-kit";

const MAX_RESULTS = 8;

const ClubTypeahead = ({ value, onChange, clubs, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() => {
    const query = (value || "").trim().toLowerCase();
    if (query.length < 2) return [];
    return clubs
      .filter((club) => club.toLowerCase().includes(query))
      .slice(0, MAX_RESULTS);
  }, [clubs, value]);

  const handleFocus = () => setIsOpen(true);
  const handleBlur = () => {
    // Delay close to allow click on dropdown items.
    setTimeout(() => setIsOpen(false), 100);
  };

  return (
    <div className="position-relative">
      <MDBInput
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoComplete="off"
      />

      {isOpen && filtered.length > 0 ? (
        <MDBListGroup
          className="position-absolute w-100"
          style={{ zIndex: 1000, top: "100%" }}
        >
          {filtered.map((club) => (
            <MDBListGroupItem
              key={club}
              action
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(club);
                setIsOpen(false);
              }}
            >
              {club}
            </MDBListGroupItem>
          ))}
        </MDBListGroup>
      ) : null}
    </div>
  );
};

export default ClubTypeahead;
