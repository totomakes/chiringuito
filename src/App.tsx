import { useState, useMemo, useEffect } from 'react';
import { Search, X, Sparkles, Flame, RefreshCw, Wine } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import menuData from '../menu.json';
import ChirinLogo from './components/ChirinLogo';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [randomDrink, setRandomDrink] = useState<any | null>(null);

  // Set the first category as active by default
  useEffect(() => {
    if (menuData.menu.length > 0 && !activeCategory) {
      setActiveCategory(menuData.menu[0].category);
    }
  }, [activeCategory]);

  const allItems = useMemo(() => {
    let items: any[] = [];
    menuData.menu.forEach((cat: any) => {
      cat.items.forEach((item: any) => {
        items.push({ ...item, parentCategory: cat.category });
      });
    });
    return items;
  }, []);

  // Filtering logic
  const filteredData = useMemo(() => {
    let data = [...menuData.menu];

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      let searchResults: any[] = [];
      
      menuData.menu.forEach(cat => {
         cat.items.forEach((item: any) => {
           const matchName = item.name?.toLowerCase().includes(lowerQuery) || false;
           const matchIngredients = item.ingredients?.toLowerCase().includes(lowerQuery) || false;
           const matchTags = item.tags?.some((tag: string) => tag?.toLowerCase().includes(lowerQuery)) || false;
           
           if (matchName || matchIngredients || matchTags) {
             searchResults.push({ ...item, matchName, matchTags, parentCategory: cat.category });
           }
         });
      });

      searchResults.sort((a, b) => {
         if (a.matchName && !b.matchName) return -1;
         if (!a.matchName && b.matchName) return 1;
         if (a.matchTags && !b.matchTags) return -1;
         if (!a.matchTags && b.matchTags) return 1;
         return 0;
      });

      if (searchResults.length > 0) {
        data = [{ category: 'Search Results', items: searchResults }];
      } else {
        data = [];
      }
    } else if (activeCategory) {
      // If no search, filter by active category
      data = data.filter(cat => cat.category === activeCategory);
    }

    return data;
  }, [searchQuery, activeCategory]);

  // Featured items logic - extracted to show at top if they exist in the filtered results
  const featuredItems = useMemo(() => {
    let items: any[] = [];
    if (searchQuery.trim() === '' && !activeCategory) {
      // If no filter, show all featured
      items = allItems.filter(i => i.tags.includes('Featured'));
    } else {
      // Show featured from within the current filtered set
      filteredData.forEach(cat => {
        cat.items.forEach((item: any) => {
          if (item.tags.includes('Featured')) {
            items.push({ ...item, parentCategory: cat.category });
          }
        });
      });
    }
    // ensure unique
    return Array.from(new Set(items.map(i => i.name))).map(name => items.find(i => i.name === name));
  }, [filteredData, activeCategory, searchQuery, allItems]);

  const surpriseMe = () => {
    const randomIndex = Math.floor(Math.random() * allItems.length);
    setRandomDrink(allItems[randomIndex]);
  };

  return (
    <div className="bg-[#131313] text-[#e5e2e1] font-['Manrope'] min-h-screen selection:bg-[#ed655d] selection:text-[#5c0006]">
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-[#131313]/80 backdrop-blur-xl shadow-[0_24px_48px_rgba(111,54,50,0.08)]">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-12 py-4 min-h-[7rem] w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-4 neon-wrapper px-2 py-2">
            <ChirinLogo className="h-[4.5rem] sm:h-24 w-auto" />
          </div>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={surpriseMe}
            className="flex items-center gap-2 bg-gradient-to-r from-[#ed655d] to-[#ffb3ac] text-[#410003] px-4 py-2 rounded-full font-bold uppercase text-xs tracking-wider shadow-[0_0_20px_rgba(237,101,93,0.3)] transition-all"
          >
            <Sparkles size={16} className="fill-[#410003]/20" />
            <span className="hidden sm:inline">¡Sorpréndeme!</span>
            <span className="sm:hidden">Sorpresa</span>
          </motion.button>
        </div>
      </header>

      <main className="pt-32 sm:pt-36 pb-12 px-4 md:px-8 max-w-7xl mx-auto lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start relative">
        
        {/* Sidebar / Top Section (Search & Categories) */}
        <section className="col-span-12 lg:col-span-4 lg:sticky lg:top-28 space-y-6 mb-10 lg:mb-0">
          <div className="relative group">
            <input
              className="w-full h-14 bg-[#353534] rounded-lg px-6 pl-14 text-[#e5e2e1] border border-[#58413f]/20 focus:border-[#ffb3ac]/50 focus:ring-2 focus:ring-[#ffb3ac]/20 placeholder:text-[#dfbfbc]/50 transition-all font-medium outline-none"
              placeholder="Search drinks, tags, ingredients..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#ffb3ac]" size={20} />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#e5e2e1]/50 hover:text-[#ffb3ac] transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="space-y-3">
             <h3 className="font-['Space_Grotesk'] font-bold text-xs uppercase tracking-[0.2em] text-[#dfbfbc]/60 px-1">Categories</h3>
             {/* Categories - Two lines flex wrap */}
             <nav className="flex flex-wrap gap-2">
               {menuData.menu.map((cat: any) => {
                 const isActive = activeCategory === cat.category && searchQuery === '';
                 return (
                   <motion.button
                     key={cat.category}
                     whileTap={{ scale: 0.95 }}
                     onClick={() => {
                       setActiveCategory(cat.category);
                       setSearchQuery('');
                     }}
                     className={`px-5 py-2.5 font-['Space_Grotesk'] font-bold uppercase tracking-tight rounded-full text-xs transition-colors duration-300 ${
                       isActive 
                         ? "bg-[#ffb3ac] text-[#410003] shadow-[0_0_15px_rgba(255,179,172,0.3)]" 
                         : "bg-[#252524] text-[#dfbfbc] hover:bg-[#353534] hover:text-[#ffb3ac]"
                     }`}
                   >
                     {cat.category}
                   </motion.button>
                 );
               })}
             </nav>
          </div>
        </section>

        {/* Drinks List Section */}
        <section className="col-span-12 lg:col-span-8 flex flex-col gap-10">
          
          <AnimatePresence mode="popLayout">
            {/* Featured Section */}
            {featuredItems.length > 0 && (
              <motion.div 
                key="featured"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 border-b border-[#ed655d]/30 pb-2">
                  <Flame className="text-[#ed655d]" size={24} />
                  <h2 className="font-['Space_Grotesk'] font-black text-2xl text-[#ed655d] tracking-tighter uppercase">Featured</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featuredItems.map((item: any, i: number) => (
                    <motion.article 
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ layout: { type: "spring", stiffness: 300, damping: 30 } }}
                      whileTap={{ scale: 0.95 }}
                      key={`featured-${item.name}`}
                      className="group relative p-6 rounded-2xl bg-gradient-to-br from-[#411b19] to-[#241312] border border-[#ed655d]/20 shadow-xl overflow-hidden cursor-pointer"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                         <Sparkles size={64} className="text-[#ffb3ac]" />
                      </div>
                      <div className="relative z-10 flex justify-between items-start mb-3">
                        <h3 className="font-['Space_Grotesk'] font-bold text-2xl text-[#ffb3ac] leading-none uppercase pr-4">{item.name}</h3>
                        <span className="font-['Space_Grotesk'] font-bold text-xl text-[#ffffff] bg-[#ed655d]/30 px-3 py-1 rounded-full">{item.price}</span>
                      </div>
                      <p className="relative z-10 text-[#e5e2e1]/90 text-sm font-['Manrope'] leading-relaxed mb-4 italic">{item.ingredients}</p>
                      <div className="relative z-10 flex flex-wrap gap-1.5">
                        {item.tags.filter((t:string) => t!=='Featured').slice(0, 4).map((tag: string) => (
                          <span key={tag} className="px-2 py-1 rounded-md bg-[#ed655d]/20 text-[#ffb3ac] text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm border border-[#ffb3ac]/10">{tag}</span>
                        ))}
                      </div>
                    </motion.article>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Normal Categories Loop */}
            {filteredData.map((categoryData: any, categoryIndex: number) => {
               // Remove featured items from normal render if we want them ONLY at top. 
               // For now, we will render all items so they exist in their natural categories too, or we filter them out to prevent duplicates.
               // It's cleaner to remove duplicates if they are already in featured, but only if we are in the ALL view without search.
               // Let's just filter them out from the category list entirely so they only show up once.
               const normalItems = categoryData.items.filter((item:any) => !item.tags.includes('Featured'));
               
               if (normalItems.length === 0) return null;

               return (
                <motion.div 
                  key={categoryData.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: categoryIndex * 0.1 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-[#58413f]/10 pb-2">
                    <h2 className="font-['Space_Grotesk'] font-black text-2xl text-[#e5e2e1] tracking-tighter uppercase">{categoryData.category}</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                    {normalItems.map((item: any, i: number) => (
                      <motion.article 
                        layout
                        key={`${categoryData.category}-${item.name}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ layout: { type: "spring", stiffness: 300, damping: 30 } }}
                        whileTap={{ scale: 0.95 }}
                        className="p-4 md:p-5 rounded-xl bg-[#252524]/60 border border-[#58413f]/5 hover:border-[#ffb3ac]/20 transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2 gap-4">
                            <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[#ffb3ac] leading-none uppercase">{item.name}</h3>
                            <span className="font-['Space_Grotesk'] font-medium text-base text-[#e5e2e1] whitespace-nowrap">{item.price}</span>
                          </div>
                          <p className="text-[#e5e2e1]/70 text-sm leading-relaxed mb-4">{item.ingredients}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-auto">
                          {item.tags.slice(0, 4).map((tag: string) => (
                            <span key={tag} className="px-2 py-1 rounded bg-[#131313]/80 text-[#dfbfbc]/80 text-[9px] font-bold uppercase tracking-wider">{tag}</span>
                          ))}
                        </div>
                      </motion.article>
                    ))}
                  </div>
                </motion.div>
               );
            })}

            {filteredData.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center flex flex-col items-center justify-center opacity-50"
              >
                <div className="text-[#ffb3ac] mb-4">
                  <Wine size={48} strokeWidth={1} />
                </div>
                <h3 className="font-['Space_Grotesk'] text-xl uppercase mb-2">No drinks found</h3>
                <p className="text-sm">Try adjusting your search or filters</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Random Drink Modal */}
      <AnimatePresence>
        {randomDrink && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setRandomDrink(null)}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1c1b1b] w-full max-w-sm rounded-[2rem] p-8 border border-[#ed655d]/30 shadow-[0_0_50px_rgba(237,101,93,0.15)] relative overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#ed655d]/20 blur-3xl rounded-full pointer-events-none"></div>
              
              <button 
                onClick={() => setRandomDrink(null)}
                className="absolute top-6 right-6 text-[#e5e2e1]/50 hover:text-[#ffb3ac] hover:bg-[#4a4a49] bg-[#353534] p-2 rounded-full transition-colors z-20"
              >
                <X size={20} />
              </button>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#ed655d] to-[#ffb3ac] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#ed655d]/30">
                  <Sparkles size={32} className="text-[#410003] fill-[#410003]/20" />
                </div>
                
                <span className="text-[#dfbfbc] text-xs font-bold uppercase tracking-widest mb-2">You should try</span>
                <h2 className="font-['Space_Grotesk'] font-black text-3xl text-[#ffb3ac] uppercase mb-2 leading-tight">
                  {randomDrink.name}
                </h2>
                
                <div className="inline-block bg-[#353534] text-[#e5e2e1] px-4 py-1.5 rounded-full font-bold text-lg mb-6">
                  {randomDrink.price}
                </div>

                <p className="text-[#e5e2e1]/80 text-sm mb-6 leading-relaxed">
                  {randomDrink.ingredients}
                </p>

                <div className="flex flex-wrap justify-center gap-2 w-full pt-4 border-t border-[#58413f]/20">
                  {randomDrink.tags.slice(0, 5).map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-[#252524] text-[#dfbfbc] rounded-md text-[10px] uppercase font-bold tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>

                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={surpriseMe}
                  className="mt-8 flex items-center justify-center gap-2 bg-[#353534] hover:bg-[#4a4a49] text-[#e5e2e1] px-6 py-3 rounded-full font-bold uppercase text-xs tracking-wider transition-colors w-full border border-[#58413f]/30"
                >
                  <RefreshCw size={16} />
                  Dame Otra
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
