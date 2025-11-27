export default function Features() {
  const features = [
    {
      icon: "🏋️‍♀️",
      title: "Workout Tracking",
      description:
        "Log your workouts with detailed exercise tracking, sets, reps, and personal records.",
    },
    {
      icon: "🎯",
      title: "Community Challenges",
      description:
        "Join exciting fitness challenges and compete with friends to stay motivated.",
    },
    {
      icon: "📝",
      title: "Fitness Journal",
      description:
        "Document your journey with daily entries, mood tracking, and progress notes.",
    },
    {
      icon: "🥗",
      title: "Nutrition Tracking",
      description:
        "Monitor your meals, track macros, and maintain a balanced diet effortlessly.",
    },
    {
      icon: "📊",
      title: "Progress Analytics",
      description:
        "Visualize your progress with detailed charts, graphs, and achievement tracking.",
    },
    {
      icon: "👥",
      title: "Social Connection",
      description:
        "Connect with friends, share achievements, and build a supportive fitness community.",
    },
  ];

  return (
    <section className="features">
      <div className="features-header">
        <h2 className="features-title">Everything You Need to Succeed</h2>
        <p className="features-subtitle">
          Comprehensive tools designed to help you achieve your fitness goals
          and maintain a healthy lifestyle.
        </p>
      </div>
      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
