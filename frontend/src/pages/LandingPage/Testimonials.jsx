export default function Testimonials() {
  const testimonials = [
    {
      name: "jack mogale",
      role: "Fitness Enthusiast",
      avatar: "👩",
      content:
        "Shukuma has completely transformed my fitness routine. The challenge feature keeps me motivated, and I love tracking my progress!",
      rating: 5,
    },
    {
      name: "Kumkani mabaso",
      role: "Marathon Runner",
      avatar: "👨",
      content:
        "The workout tracking is phenomenal. I can see my improvements over time and the community support is incredible.",
      rating: 5,
    },
    {
      name: "Sibongile Dlamini",
      role: "Yoga Instructor",
      avatar: "👩",
      content:
        "Best fitness app I've used! The nutrition tracking helps me stay on top of my diet, and the journal feature is perfect for reflection.",
      rating: 5,
    },
  ];

  return (
    <section className="testimonials">
      <div className="testimonials-header">
        <h2 className="testimonials-title">Loved by Thousands</h2>
        <p className="testimonials-subtitle">
          See what our community has to say about their fitness journey with
          Shukuma.
        </p>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="testimonial-card">
            <div className="testimonial-rating">
              {[...Array(testimonial.rating)].map((_, i) => (
                <span key={i} className="star">
                  ⭐
                </span>
              ))}
            </div>
            <p className="testimonial-content">"{testimonial.content}"</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">{testimonial.avatar}</div>
              <div className="testimonial-info">
                <div className="testimonial-name">{testimonial.name}</div>
                <div className="testimonial-role">{testimonial.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
