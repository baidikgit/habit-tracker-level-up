import { useState } from "react";


export function AddHabitModal({ onSave, onClose }) {
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [customDays, setCustomDays] = useState(2);
  const [type, setType] = useState("positive");

  function handleSave() {
    if (!name.trim()) return;

    const frequencyValue =
      frequency === "custom"
        ? { type: "custom", every: Math.max(2, customDays) }
        : frequency;

    onSave({ name: name.trim(), frequency: frequencyValue, type });
    onClose();
  }

  // Shared styles used multiple times
  const fieldLabelStyle = {
    display: "block",
    fontSize: 10,
    color: "#484848",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    fontFamily: "'Iceberg', sans-serif",
    marginBottom: 8,
  };

  const textInputStyle = {
    width: "100%",
    padding: "10px 12px",
    background: "#1a1a1a",
    border: "1px solid #2e2e2e",
    borderRadius: 4,
    fontSize: 16,
    color: "#e0e0e0",
    outline: "none",
  };

  function SegmentButton({ value, currentValue, onSelect, children }) {
    const isActive = currentValue === value;
    return (
      <button
        onClick={() => onSelect(value)}
        style={{
          flex: 1,
          padding: "9px 0",
          border: isActive ? "1px solid #555" : "1px solid #252525",
          borderRadius: 4,
          background: isActive ? "#252525" : "#141414",
          color: isActive ? "#ddd" : "#444",
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: "0.04em",
          transition: "all 0.15s",
        }}
      >
        {children}
      </button>
    );
  }

  return (
    // Clicking the backdrop closes the modal
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
    >
      {/* Clicking inside the modal does not close it */}
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          background: "#161616",
          border: "1px solid #2a2a2a",
          borderRadius: 8,
          padding: "36px",
          width: 440,
          maxWidth: "92vw",
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 400, marginBottom: 28 }}>
          New Habit
        </div>

        {/* Name */}
        <div style={{ marginBottom: 20 }}>
          <label style={fieldLabelStyle}>Name</label>
          <input
            autoFocus
            style={textInputStyle}
            placeholder="e.g. Morning Run"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleSave()}
          />
        </div>

        {/* Frequency */}
        <div style={{ marginBottom: 20 }}>
          <label style={fieldLabelStyle}>Frequency</label>
          <div style={{ display: "flex", gap: 6 }}>
            <SegmentButton
              value="daily"
              currentValue={frequency}
              onSelect={setFrequency}
            >
              Daily
            </SegmentButton>
            <SegmentButton
              value="weekly"
              currentValue={frequency}
              onSelect={setFrequency}
            >
              Weekly
            </SegmentButton>
            <SegmentButton
              value="custom"
              currentValue={frequency}
              onSelect={setFrequency}
            >
              Custom
            </SegmentButton>
          </div>

          {frequency === "custom" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 12,
              }}
            >
              <span style={{ fontSize: 13, color: "#555" }}>Every</span>
              <input
                type="number"
                min={2}
                max={30}
                value={customDays}
                onChange={(event) => setCustomDays(Number(event.target.value))}
                style={{ ...textInputStyle, width: 72 }}
              />
              <span style={{ fontSize: 13, color: "#555" }}>days</span>
            </div>
          )}
        </div>

        {/* Type */}
        <div style={{ marginBottom: 30 }}>
          <label style={fieldLabelStyle}>Type</label>
          <div style={{ display: "flex", gap: 6 }}>
            <SegmentButton
              value="positive"
              currentValue={type}
              onSelect={setType}
            >
              Build (positive)
            </SegmentButton>
            <SegmentButton
              value="negative"
              currentValue={type}
              onSelect={setType}
            >
              Break (negative)
            </SegmentButton>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 20px",
              border: "1px solid #2a2a2a",
              borderRadius: 4,
              fontSize: 13,
              color: "#555",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            style={{
              padding: "9px 24px",
              backgroundColor: name.trim() ? "#22c55e" : "#1a1a1a",
              color: name.trim() ? "#000" : "#333",
              border: "none",
              borderRadius: 4,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.04em",
              transition: "all 0.15s",
            }}
          >
            Add Habit
          </button>
        </div>
      </div>
    </div>
  );
}