import "./Spinner.css";

export default function Spinner({
  size = "medium",
  color = "primary",
  fullScreen = false,
  text = "",
}) {
  const classNames = ["spinner", `spinner-${size}`, `spinner-${color}`]
    .filter(Boolean)
    .join(" ");

  if (fullScreen) {
    return (
      <div className="spinner-fullscreen">
        <div className="spinner-container">
          <div className={classNames}></div>
          {text && <p className="spinner-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="spinner-container">
      <div className={classNames}></div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
}
