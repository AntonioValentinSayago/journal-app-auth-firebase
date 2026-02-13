import Sidebar from "./components/NavMenu";
import SearchBox from "./components/ui/SearchBox";


export default function App() {

  const STATIC_ITEMS = [
    { id: "1", label: "Folio 10023", description: "Alta prioridad" },
    { id: "2", label: "Folio 10024", description: "En seguimiento" },
    { id: "3", label: "Incidente red", description: "Área infraestructura" },
    { id: "4", label: "Usuario: Cesar", description: "Administrador" },
  ];

  return (
    <div className="min-h-screen bg-slate-800">
      <Sidebar onItemClick={(id) => console.log("clicked:", id)} />
      <main className="md:pl-72 p-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-800 p-6">
          <header className="flex w-full items-center justify-between">
            <SearchBox
              items={STATIC_ITEMS}
              placeholder="Buscar folios, tags, usuarios…"
              onSearch={(q) => console.log("search:", q)}
              onSelect={(item) => console.log("selected:", item)}
            />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/BBVA_2019.svg/1280px-BBVA_2019.svg.png" 
              alt="ServiceNoew-BBVA"
              width={150} 
            />
          </header>
        </div>
      </main>
    </div>
  );
}
