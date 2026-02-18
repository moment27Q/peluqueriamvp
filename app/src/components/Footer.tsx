export const Footer = () => {
    return (
        <footer className="bg-white py-12 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3 opacity-80 group hover:opacity-100 transition-opacity cursor-default">
                    <span className="material-symbols-outlined text-2xl text-gray-400 group-hover:text-primary transition-colors">content_cut</span>
                    <h2 className="text-lg font-extrabold tracking-tighter uppercase text-gray-500 group-hover:text-gray-800 transition-colors">mi pagina.com</h2>
                </div>
                <div className="flex gap-8">
                    <button className="text-gray-400 hover:text-gray-800 transition-colors transform hover:scale-110"><span className="material-symbols-outlined">volume_up</span></button>
                    <button className="text-gray-400 hover:text-gray-800 transition-colors transform hover:scale-110"><span className="material-symbols-outlined">public</span></button>
                    <button className="text-gray-400 hover:text-gray-800 transition-colors transform hover:scale-110"><span className="material-symbols-outlined">mail</span></button>
                </div>
                <p className="text-gray-500 text-sm font-medium">© 2026 mi pagina.com. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
};

