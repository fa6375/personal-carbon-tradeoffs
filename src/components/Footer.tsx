import './Footer.css'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <p>
        © {year} Carbon Choices · Course project for ISTE.260 Designing the User Experience
      </p>
      <p className="footer__note">
        Early preview. No live data is shown yet.
      </p>
    </footer>
  )
}
