import FolioDetailView from "./components/kanban/FolioDetailView";
import FoliosTableView from "./components/kanban/FoliosTableView";
import KanbanBoard from "./components/kanban/KanbanBoard";
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
    <div className="min-h-screen bg-slate-200">
      <Sidebar onItemClick={(id) => console.log("clicked:", id)} />
      <main className="md:pl-72 p-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-200 p-6">
          <header className="flex w-full items-center justify-between mb-16">
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
          <article>
            <KanbanBoard />
          </article>
          <section>
            <FolioDetailView />
          </section>
          <section>
            <FoliosTableView/>
          </section>
        </div>
      </main>
    </div>
  );
}
