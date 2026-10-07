import { ExternalLink, Menu } from 'lucide-react'
import { SOURCE_REPO } from '../docs'
import Search from './Search'

export default function Header({ onMenu, menuOpen }: { onMenu?: () => void; menuOpen?: boolean }) {
  return (
    <header className="site-header">
      {onMenu && <button className="icon-btn menu-btn" onClick={onMenu} aria-label="Danh mục tài liệu" aria-expanded={menuOpen} aria-controls="doc-nav"><Menu size={22} /></button>}
      <a className="brand" href="#/">REST API Guidelines <small>Tiếng Việt</small></a>
      <Search />
      <a className="source-link" href={SOURCE_REPO} target="_blank" rel="noreferrer"><span>Bản gốc</span><ExternalLink size={16} aria-hidden /><span className="sr-only">(mở trang mới)</span></a>
    </header>
  )
}
