'use client'
import "./AdBar.css"
import { useState } from 'react'
import { trackEvent } from '../analytics'

const defaultLinks = [
    {
      url: 'https://randomgameidea.com',
      title: 'Random Game Idea',
      description: 'Generate unique board game ideas instantly by combining mechanics, themes, and turn orders.'
    },
    {
        url: 'https://templative.net',
        title: 'Templative',
        description: 'Batch board game art updates, export to Tabletop Simulator, pdf, and the GameCrafter.'
    },
    {
        url: 'https://playtestfeedback.com',
        title: 'Playtest Feedback',
        description: 'Organize playtests, collect feedback, take photos, build your mailing list, and improve your games.'
    },
    {
        url: 'https://boardgameprototypes.com',
        title: 'Board Game Prototypes',
        description: 'Share your prototypes and sellsheets with publishers.'
    },
]


export default function AdBar({ 
    via = "", 
    links = defaultLinks,
    defaultIcon = '/default-favicon.png'
}) {
    const [activePopover, setActivePopover] = useState(null)

    return (
        <div className="adbar">
            {links.map((link, index) => (
                <div 
                    key={index}
                    className="adbar-item-wrapper"
                    onMouseEnter={() => setActivePopover(index)}
                    onMouseLeave={() => setActivePopover(null)}
                >
                    <a 
                        href={(link.url) + (via ? `?via=${via}` : '')} 
                        // target="_blank" 
                        // rel="noopener noreferrer"
                        onClick={(e) => {
                            e.preventDefault();
                            trackEvent(`adbar_${link.title}_click`)
                            window.location.href = (link.url) + (via ? `?via=${via}` : '');
                        }}
                        className="adbar-icon"
                    >
                        <img 
                            src={`${link.url}/icon.ico`}
                            alt={link.title || `Visit ${link.url}`}
                            onError={(e) => {
                                e.target.src = defaultIcon
                            }}
                        />
                    </a>
                    {activePopover === index && (
                        <div className="custom-popover">
                            {link.title && <div className="popover-title">
                                {link.title || new URL(link.url || link).hostname}
                            </div>}
                            {link.description && <div className="popover-content">
                                {link.description}
                            </div>}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}