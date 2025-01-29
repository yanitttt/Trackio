-- Création de la table des types de produits
CREATE TABLE IF NOT EXISTS product_types (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             name TEXT NOT NULL UNIQUE,          -- Nom du produit (ex : Cigarettes)
                                             description TEXT DEFAULT NULL,      -- Description optionnelle
                                             created_at DATETIME DEFAULT CURRENT_TIMESTAMP -- Date de création
);

-- Création de la table pour la consommation quotidienne
CREATE TABLE IF NOT EXISTS daily_consumption (
                                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                 product_type_id INTEGER NOT NULL,   -- Référence au produit
                                                 date DATE NOT NULL,                 -- Date de la consommation
                                                 quantity INTEGER NOT NULL DEFAULT 0, -- Quantité consommée
                                                 note TEXT DEFAULT NULL,             -- Commentaire optionnel
                                                 created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Date d'ajout
                                                 FOREIGN KEY (product_type_id) REFERENCES product_types (id) ON DELETE CASCADE
    );

-- Ajout d'une vue pour résumer la consommation par produit
CREATE VIEW IF NOT EXISTS consumption_summary AS
SELECT
    p.id AS product_id,
    p.name AS product_name,
    SUM(c.quantity) AS total_quantity,
    COUNT(c.id) AS total_days
FROM product_types p
         LEFT JOIN daily_consumption c ON p.id = c.product_type_id
GROUP BY p.id;
