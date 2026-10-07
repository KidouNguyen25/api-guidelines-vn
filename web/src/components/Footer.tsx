import { ExternalLink } from 'lucide-react'
import { LICENSE_URL, SOURCE_REPO } from '../docs'

export default function Footer() {
  return (
    <footer className="site-footer">
      <p>Nội dung gốc thuộc Microsoft, công bố theo giấy phép <a href={LICENSE_URL} target="_blank" rel="noreferrer">CC BY 4.0</a>. Bản dịch tiếng Việt theo kho <a href={SOURCE_REPO} target="_blank" rel="noreferrer">microsoft/api-guidelines <ExternalLink size={13} aria-hidden /></a> (nhánh vNext).</p>
    </footer>
  )
}
