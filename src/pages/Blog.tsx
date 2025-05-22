
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Lista de artículos simulados
const articles = [
  {
    id: 1,
    title: "5 Estrategias para optimizar el rendimiento de tu ASIC miner",
    excerpt: "Descubre cómo mejorar la eficiencia y longevidad de tus equipos de minería con estos consejos prácticos de expertos.",
    category: "Guías",
    date: "16 Mayo, 2025",
    readTime: "8 min",
    image: "https://images.unsplash.com/photo-1640833906651-6bd1af7aeea3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 2,
    title: "El impacto del último halving de Bitcoin en la minería",
    excerpt: "Análisis detallado de cómo el cuarto halving de Bitcoin está afectando a los mineros y qué esperar en los próximos meses.",
    category: "Análisis",
    date: "10 Mayo, 2025",
    readTime: "12 min",
    image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 3,
    title: "Minería con energía renovable: Casos de éxito",
    excerpt: "Exploramos diferentes proyectos de minería de Bitcoin que están utilizando con éxito fuentes de energía renovable.",
    category: "Sostenibilidad",
    date: "5 Mayo, 2025",
    readTime: "10 min",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 4,
    title: "Introducción a la minería en frío: Ventajas de las regiones nórdicas",
    excerpt: "Cómo las bajas temperaturas en países como Islandia y Suecia están creando un nuevo paradigma para la minería de Bitcoin.",
    category: "Tendencias",
    date: "28 Abril, 2025",
    readTime: "9 min",
    image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 5,
    title: "Comparativa: Antminer S19 Pro vs Whatsminer M30S+",
    excerpt: "Analizamos en profundidad las especificaciones, eficiencia energética y rentabilidad de dos de los ASICs más populares del mercado.",
    category: "Equipos",
    date: "20 Abril, 2025",
    readTime: "14 min",
    image: "https://images.unsplash.com/photo-1624996379697-f01d168b1a52?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 6,
    title: "¿Cómo elegir el pool de minería adecuado?",
    excerpt: "Factores clave a considerar al seleccionar un pool de minería: comisiones, método de pago, estabilidad y más.",
    category: "Guías",
    date: "15 Abril, 2025",
    readTime: "7 min",
    image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  }
];

// Categorías disponibles para filtrar
const categories = [
  "Todas", "Guías", "Análisis", "Sostenibilidad", "Tendencias", "Equipos"
];

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");
  
  // Filtra los artículos por búsqueda y categoría
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "Todas" || article.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Blog</h1>
        <p className="text-muted-foreground">Artículos y noticias sobre minería de Bitcoin</p>
      </div>
      
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Input 
            placeholder="Buscar artículos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="bg-tmcdark border border-border rounded-md p-1 flex flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className="mr-1 last:mr-0"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="border border-border rounded-lg overflow-hidden bg-tmcdark-card hover:border-bitcoin transition-colors"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="bg-bitcoin/10 text-bitcoin px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                  <div className="text-muted-foreground">
                    {article.date} • {article.readTime}
                  </div>
                </div>
                <h3 className="text-lg font-semibold leading-tight hover:text-bitcoin transition-colors">
                  {article.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Leer artículo
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-border rounded-lg p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-tmcdark-card rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 13a4 4 0 100-8 4 4 0 000 8z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No se encontraron artículos</h3>
          <p className="text-muted-foreground mb-4">
            No hay artículos que coincidan con tu búsqueda o filtro seleccionado.
          </p>
          <Button onClick={() => {setSearchTerm(""); setActiveCategory("Todas");}}>
            Limpiar filtros
          </Button>
        </div>
      )}
      
      <div className="mt-12 border border-border rounded-lg p-6 bg-tmcdark-card">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0 w-20 h-20 bg-bitcoin/10 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-bitcoin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div className="flex-grow text-center md:text-left">
            <h2 className="text-xl font-medium mb-1">Suscríbete a nuestro newsletter</h2>
            <p className="text-muted-foreground mb-4">
              Recibe los últimos artículos, tutoriales y noticias directamente en tu bandeja de entrada.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <Input 
                placeholder="Tu dirección de email" 
                type="email"
                className="flex-grow"
              />
              <Button>
                Suscribirse
              </Button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Blog;
