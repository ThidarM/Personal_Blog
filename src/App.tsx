import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { Article, ViewType } from "./types";
import Navbar from "./components/Navbar";
import GuestHome from "./components/GuestHome";
import GuestArticle from "./components/GuestArticle";
import AdminDashboard from "./components/AdminDashboard";
import AdminForm from "./components/AdminForm";

const getRouteFromHash = (): ViewType => {
  const hash = window.location.hash;
  if (!hash || hash === "#/" || hash === "#/home") {
    return { name: "home" };
  }
  if (hash.startsWith("#/article/")) {
    const id = hash.replace("#/article/", "");
    return { name: "article", articleId: id };
  }
  if (hash === "#/admin") {
    return { name: "admin" };
  }
  if (hash === "#/new") {
    return { name: "new" };
  }
  if (hash.startsWith("#/edit/")) {
    const id = hash.replace("#/edit/", "");
    return { name: "edit", articleId: id };
  }
  return { name: "home" };
};

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>({ name: "home" });
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync hash changes with React State
  useEffect(() => {
    // Initial load
    const initialRoute = getRouteFromHash();
    setCurrentView(initialRoute);
    
    // Fallback default hash if empty
    if (!window.location.hash) {
      window.location.hash = "#/home";
    }

    const handleHashChange = () => {
      setCurrentView(getRouteFromHash());
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Fetch articles from the server
  const fetchArticles = () => {
    setLoading(true);
    fetch("/api/articles")
      .then((res) => res.json())
      .then((data) => {
        setArticles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch articles:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Set hash and view reactively
  const navigateTo = (view: ViewType) => {
    let hash = "#/home";
    if (view.name === "article") {
      hash = `#/article/${view.articleId}`;
    } else if (view.name === "admin") {
      hash = "#/admin";
    } else if (view.name === "new") {
      hash = "#/new";
    } else if (view.name === "edit") {
      hash = `#/edit/${view.articleId}`;
    }
    
    window.location.hash = hash;
    setCurrentView(view);
  };

  // Create article handler
  const handleCreateArticle = async (articleData: Omit<Article, "id">): Promise<boolean> => {
    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(articleData)
      });
      
      if (response.ok) {
        fetchArticles(); // refresh cache
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to create article:", error);
      return false;
    }
  };

  // Update article handler
  const handleUpdateArticle = async (articleData: Omit<Article, "id">, id?: string): Promise<boolean> => {
    if (!id) return false;
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(articleData)
      });
      
      if (response.ok) {
        fetchArticles(); // refresh cache
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update article:", error);
      return false;
    }
  };

  // Delete article handler
  const handleDeleteArticle = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        fetchArticles(); // refresh cache
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to delete article:", error);
      return false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/50">
      <Navbar currentView={currentView} onNavigate={navigateTo} />
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {(() => {
            switch (currentView.name) {
              case "home":
                return (
                  <div key="home">
                    <GuestHome
                      articles={articles}
                      onNavigate={navigateTo}
                    />
                  </div>
                );
              case "article":
                return (
                  <div key={`article-${currentView.articleId}`}>
                    <GuestArticle
                      articleId={currentView.articleId}
                      onNavigate={navigateTo}
                    />
                  </div>
                );
              case "admin":
                return (
                  <div key="admin">
                    <AdminDashboard
                      articles={articles}
                      onNavigate={navigateTo}
                      onDeleteArticle={handleDeleteArticle}
                    />
                  </div>
                );
              case "new":
                return (
                  <div key="new">
                    <AdminForm
                      mode="new"
                      onNavigate={navigateTo}
                      onSubmit={handleCreateArticle}
                    />
                  </div>
                );
              case "edit":
                return (
                  <div key={`edit-${currentView.articleId}`}>
                    <AdminForm
                      mode="edit"
                      articleId={currentView.articleId}
                      onNavigate={navigateTo}
                      onSubmit={handleUpdateArticle}
                    />
                  </div>
                );
              default:
                return (
                  <div key="fallback">
                    <GuestHome
                      articles={articles}
                      onNavigate={navigateTo}
                    />
                  </div>
                );
            }
          })()}
        </AnimatePresence>
      </main>
    </div>
  );
}
