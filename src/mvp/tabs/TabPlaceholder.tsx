interface Props {
  title: string;
  description: string;
  step: string;
}

export default function TabPlaceholder({ title, description, step }: Props) {
  return (
    <div className="nova-tab-placeholder">
      <h2>{title}</h2>
      <p>{description}</p>
      <span className="step-tag">Lands in {step}</span>
    </div>
  );
}
