import "./Card.css";

export default function Card({
  children,
  variant = "default",
  hover = false,
  padding = "medium",
  className = "",
  ...props
}) {
  const classNames = [
    "card",
    `card-${variant}`,
    `card-padding-${padding}`,
    hover && "card-hover",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return <div className={`card-header ${className}`}>{children}</div>;
}

export function CardBody({ children, className = "" }) {
  return <div className={`card-body ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return <div className={`card-footer ${className}`}>{children}</div>;
}
