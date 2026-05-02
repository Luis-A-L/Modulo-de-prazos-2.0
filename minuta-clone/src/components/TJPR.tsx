import React, { useEffect, useId, useRef, useState } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    Bell,
    ChevronDown,
    ChevronUp,
    CircleAlert,
    Copy,
    LogOut,
    Minus,
    Moon,
    RotateCcw,
    Sun,
    User,
    X
} from 'lucide-react';

const renderIcon = (icon: string, className = 'h-4 w-4') => {
    const iconProps = { className, 'aria-hidden': true as const };

    switch (icon) {
        case 'arrow_back':
            return <ArrowLeft {...iconProps} />;
        case 'arrow_forward':
            return <ArrowRight {...iconProps} />;
        case 'content_copy':
            return <Copy {...iconProps} />;
        case 'refresh':
            return <RotateCcw {...iconProps} />;
        case 'notifications':
            return <Bell {...iconProps} />;
        case 'light_mode':
            return <Sun {...iconProps} />;
        case 'dark_mode':
            return <Moon {...iconProps} />;
        case 'person':
            return <User {...iconProps} />;
        case 'logout':
            return <LogOut {...iconProps} />;
        case 'expand_less':
            return <ChevronUp {...iconProps} />;
        case 'expand_more':
            return <ChevronDown {...iconProps} />;
        case 'linear_scale':
            return <Minus {...iconProps} />;
        case 'close':
            return <X {...iconProps} />;
        case 'error':
            return <CircleAlert {...iconProps} />;
        default:
            return null;
    }
};

export const TJPRCard = ({ title, subtitle, children, actions, className = '', icon, ...props }: any) => {
    return (
        <div className={`tjpr-card ${className}`} {...props}>
            {(title || subtitle || icon) && (
                <div className="px-6 py-4 border-b border-[rgba(27,38,59,0.08)] dark:border-[rgba(144,169,201,0.18)]">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <span className="text-tjpr-navy-700 dark:text-tjpr-navy-500">
                                {renderIcon(icon, 'h-5 w-5')}
                            </span>
                        )}
                        <div className="flex-1">
                            {title && (
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {title}
                                </h3>
                            )}
                            {subtitle && (
                                <p className="mt-1 text-sm text-tjpr-gray-700 dark:text-[#b5c4d6]">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
            {actions && (
                <div className="flex items-center justify-end gap-3 border-t border-[rgba(27,38,59,0.08)] dark:border-[rgba(144,169,201,0.18)] bg-[rgba(248,249,250,0.7)] dark:bg-[rgba(0,0,0,0.2)] px-6 py-4">
                    {actions}
                </div>
            )}
        </div>
    );
};

export const TJPRButton = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    disabled = false,
    className = '',
    type = 'button',
    ...props
}: any) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-none font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950 hover:-translate-y-0.5';

    const variantClasses: any = {
        primary: 'bg-tjpr-navy-800 text-white shadow-sm hover:bg-[#142033] hover:shadow-md focus-visible:ring-tjpr-gold dark:bg-[#2a4a6e] dark:hover:bg-[#335580] dark:text-white dark:shadow-md',
        secondary: 'border border-[rgba(27,38,59,0.14)] bg-white/90 text-tjpr-navy-900 shadow-sm hover:bg-white hover:shadow-md focus-visible:ring-tjpr-navy-700 dark:border-[rgba(144,169,201,0.3)] dark:bg-[rgba(255,255,255,0.08)] dark:text-[#e8edf3] dark:hover:bg-[rgba(255,255,255,0.14)] dark:hover:text-white',
        success: 'bg-tjpr-success text-white shadow-sm hover:bg-green-700 focus-visible:ring-tjpr-success',
        warning: 'bg-tjpr-warning text-white shadow-sm hover:bg-orange-600 focus-visible:ring-tjpr-warning',
        error: 'bg-tjpr-error text-white shadow-sm hover:bg-red-700 focus-visible:ring-tjpr-error',
        ghost: 'bg-transparent text-tjpr-gray-700 hover:bg-[rgba(27,38,59,0.08)] focus-visible:ring-tjpr-navy-700 dark:text-[#b5c4d6] dark:hover:bg-[rgba(255,255,255,0.1)] dark:focus-visible:ring-tjpr-gold'
    };

    const sizeClasses: any = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    };

    const disabledClasses = 'pointer-events-none cursor-not-allowed opacity-40 dark:opacity-35';
    const iconElement = icon ? renderIcon(icon, 'h-[1em] w-[1em]') : null;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? disabledClasses : ''} ${className}`}
            {...props}
        >
            {iconElement && iconPosition === 'left' && iconElement}
            {children}
            {iconElement && iconPosition === 'right' && iconElement}
        </button>
    );
};

export const TJPRInput = ({
    label,
    value,
    onChange,
    type = 'text',
    placeholder = '',
    required = false,
    error = '',
    helperText = '',
    icon,
    className = '',
    id,
    ...props
}: any) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label htmlFor={inputId} className="tjpr-label">
                    {label}
                    {required && <span className="ml-1 text-tjpr-error">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        {renderIcon(icon, 'h-4 w-4')}
                    </div>
                )}
                <input
                    id={inputId}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className={`tjpr-input ${icon ? 'pl-10' : ''} ${error ? 'border-tjpr-error' : ''}`}
                    aria-invalid={Boolean(error)}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 flex items-center gap-1 text-sm text-tjpr-error">
                    {renderIcon('error', 'h-4 w-4')}
                    {error}
                </p>
            )}
            {helperText && !error && (
                <p className="mt-1 text-sm text-tjpr-gray-700 dark:text-gray-300">
                    {helperText}
                </p>
            )}
        </div>
    );
};

export const TJPRHeader = ({ user, onLogout, onToggleDarkMode, isDarkMode, onOpenProfile, notifications, onToggleNotifications }: any) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const menuId = useId();
    const headerClass = isDarkMode ? 'tjpr-header tjpr-header-dark' : 'tjpr-header tjpr-header-light';
    const markClass = isDarkMode ? 'tjpr-header-mark tjpr-header-mark-dark' : 'tjpr-header-mark tjpr-header-mark-light';
    const titleClass = isDarkMode ? 'tjpr-header-title tjpr-header-title-dark' : 'tjpr-header-title tjpr-header-title-light';
    const subtitleClass = isDarkMode ? 'tjpr-header-subtitle tjpr-header-subtitle-dark' : 'tjpr-header-subtitle tjpr-header-subtitle-light';
    const iconButtonClass = isDarkMode ? 'tjpr-header-icon-button tjpr-header-icon-button-dark' : 'tjpr-header-icon-button tjpr-header-icon-button-light';
    const menuButtonClass = isDarkMode ? 'tjpr-header-menu-button tjpr-header-menu-button-dark' : 'tjpr-header-menu-button tjpr-header-menu-button-light';
    const avatarClass = isDarkMode ? 'tjpr-header-avatar tjpr-header-avatar-dark' : 'tjpr-header-avatar tjpr-header-avatar-light';
    const menuPanelClass = isDarkMode ? 'tjpr-header-menu-panel tjpr-header-menu-panel-dark' : 'tjpr-header-menu-panel tjpr-header-menu-panel-light';
    const menuItemClass = isDarkMode ? 'tjpr-header-menu-item tjpr-header-menu-item-dark' : 'tjpr-header-menu-item tjpr-header-menu-item-light';

    useEffect(() => {
        if (!isMenuOpen) return;

        const handlePointerDown = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isMenuOpen]);

    return (
        <header className={`${headerClass} sticky top-0 z-50`}>
            <div className="max-w-full px-4 sm:px-6 lg:px-8">
                <div className="flex min-h-16 items-center justify-between gap-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div aria-hidden="true" className={markClass}>
                            TJ
                        </div>
                        <div className="min-w-0">
                            <p className={titleClass}>
                                Gerador de Minutas
                            </p>
                            <p className={subtitleClass}>
                                Tribunal de Justiça do Paraná • Assessoria P-SEP-AR
                            </p>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                        {onToggleNotifications && (
                            <button
                                type="button"
                                onClick={onToggleNotifications}
                                className={`relative ${iconButtonClass}`}
                                title="Notificações"
                                aria-label="Abrir notificações"
                            >
                                {renderIcon('notifications', 'h-5 w-5')}
                                {notifications && notifications.length > 0 && (
                                    <span className={`pointer-events-none absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-none border-2 bg-red-500 ${isDarkMode ? 'border-tjpr-navy-900' : 'border-white'}`}></span>
                                )}
                            </button>
                        )}

                        {onToggleDarkMode && (
                            <button
                                type="button"
                                onClick={onToggleDarkMode}
                                className={iconButtonClass}
                                title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
                                aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
                                aria-pressed={isDarkMode}
                            >
                                {renderIcon(isDarkMode ? 'light_mode' : 'dark_mode', 'h-5 w-5')}
                            </button>
                        )}

                        <div className="relative" ref={menuRef}>
                            <button
                                type="button"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={menuButtonClass}
                                aria-label="Abrir menu do usuário"
                                aria-haspopup="menu"
                                aria-expanded={isMenuOpen}
                                aria-controls={menuId}
                            >
                                <div className={avatarClass} style={{ backgroundColor: user?.avatarColor || '#C5A572' }}>
                                    {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span className={`hidden max-w-32 truncate text-sm font-medium md:block ${isDarkMode ? 'text-white' : 'text-tjpr-navy-900'}`}>
                                    {user?.displayName || user?.email?.split('@')[0] || 'Usuário'}
                                </span>
                                {renderIcon(isMenuOpen ? 'expand_less' : 'expand_more', `h-4 w-4 ${isDarkMode ? 'text-white' : 'text-tjpr-navy-800'}`)}
                            </button>

                            {isMenuOpen && (
                                <div id={menuId} role="menu" className={`absolute right-0 mt-2 w-52 py-2 ${menuPanelClass}`}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (onOpenProfile) onOpenProfile();
                                            setIsMenuOpen(false);
                                        }}
                                        className={menuItemClass}
                                        role="menuitem"
                                    >
                                        {renderIcon('person', 'h-4 w-4')}
                                        Meu Perfil
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (onLogout) onLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className={`${menuItemClass} text-tjpr-error`}
                                        role="menuitem"
                                    >
                                        {renderIcon('logout', 'h-4 w-4')}
                                        Sair
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export const TJPRBadge = ({ children, variant = 'default', icon }: any) => {
    const variants: any = {
        default: 'border border-[rgba(27,38,59,0.12)] bg-[rgba(27,38,59,0.08)] text-tjpr-navy-800 shadow-sm dark:border-white/10 dark:bg-[rgba(255,255,255,0.08)] dark:text-gray-100',
        success: 'tjpr-badge-success',
        warning: 'tjpr-badge-warning',
        error: 'tjpr-badge-error',
        info: 'border border-blue-200 bg-blue-100/90 text-blue-900 shadow-sm dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-100'
    };

    return (
        <span className={`tjpr-badge rounded-none ${variants[variant]}`}>
            {icon && <span className="mr-1">{renderIcon(icon, 'h-3 w-3')}</span>}
            {children}
        </span>
    );
};

export const TJPRFormGroup = ({ children, cols = 1, className = '' }: any) => {
    const gridCols: any = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    };

    return (
        <div className={`grid ${gridCols[cols]} gap-4 ${className}`}>
            {children}
        </div>
    );
};

export const TJPRModal = ({ isOpen, onClose, title, children, maxWidth = '2xl', icon }: any) => {
    if (!isOpen) return null;

    const maxWidths: any = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '4xl': 'max-w-4xl',
        '6xl': 'max-w-6xl'
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true">
            <div className={`max-h-[90vh] w-full overflow-auto ${maxWidths[maxWidth]}`}>
                <div className="tjpr-card">
                    <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {icon && <span className="text-tjpr-navy-700 dark:text-tjpr-navy-500">{renderIcon(icon, 'h-5 w-5')}</span>}
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {title}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-none p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                                aria-label="Fechar modal"
                            >
                                {renderIcon('close', 'h-5 w-5 text-gray-500')}
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CookieConsent = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('lgpd_consent');
        if (!consent) {
            setVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('lgpd_consent', 'true');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[80] animate-fade-in border-t border-[rgba(27,38,59,0.12)] dark:border-[rgba(144,169,201,0.18)] bg-[rgba(255,253,248,0.97)] dark:bg-[rgba(13,27,42,0.97)] p-4 shadow-[0_-4px_24px_-4px_rgba(13,27,42,0.18)] dark:shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.48)] backdrop-blur-sm">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="text-sm text-[#3d4a58] dark:text-[#b5c4d6]">
                    <p><strong className="text-tjpr-navy-900 dark:text-white">Este sistema utiliza dados para funcionamento.</strong></p>
                    <p>Utilizamos armazenamento local para salvar suas preferências e coletamos dados de uso para fins de auditoria e melhoria, em conformidade com a LGPD. Ao continuar, você concorda com nossa Política de Privacidade.</p>
                </div>
                <div className="flex flex-shrink-0 gap-3">
                    <button
                        type="button"
                        onClick={handleAccept}
                        className="rounded-none bg-tjpr-navy-800 dark:bg-[#2a4a6e] px-6 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#142033] dark:hover:bg-[#335580] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tjpr-gold focus-visible:ring-offset-2"
                    >
                        Concordar e Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};
