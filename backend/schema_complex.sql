    -- Création de la table des types de produits
    CREATE TABLE IF NOT EXISTS product_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Création de la table pour la consommation quotidienne
    CREATE TABLE IF NOT EXISTS daily_consumption (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_type_id INTEGER NOT NULL,
        date DATE NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        note TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_type_id) REFERENCES product_types (id) ON DELETE CASCADE
    );

    -- Création de la table pour l'historique des modifications (future extensibilité)
    CREATE TABLE IF NOT EXISTS modifications_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        record_id INTEGER NOT NULL,
        operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Ajout d'une table pour les utilisateurs (future extensibilité)
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Ajout d'une table pour les préférences utilisateur
    CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        preference_key TEXT NOT NULL,
        preference_value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    -- Création d'une vue pour obtenir la consommation totale par produit
    CREATE VIEW IF NOT EXISTS consumption_summary AS
    SELECT
        p.id AS product_id,
        p.name AS product_name,
        SUM(c.quantity) AS total_quantity,
        COUNT(c.id) AS total_days
    FROM product_types p
    LEFT JOIN daily_consumption c ON p.id = c.product_type_id
    GROUP BY p.id;

    -- Trigger pour mettre à jour la colonne "updated_at" de daily_consumption
    CREATE TRIGGER IF NOT EXISTS update_daily_consumption_updated_at
    AFTER UPDATE ON daily_consumption
    FOR EACH ROW
    BEGIN
        UPDATE daily_consumption SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;

    -- Trigger pour enregistrer l'historique des modifications
    CREATE TRIGGER IF NOT EXISTS log_modifications
    AFTER INSERT OR UPDATE OR DELETE ON daily_consumption
    FOR EACH ROW
    BEGIN
        INSERT INTO modifications_history (table_name, record_id, operation)
        VALUES (
            'daily_consumption',
            CASE WHEN (TG_OP = 'DELETE') THEN OLD.id ELSE NEW.id END,
            CASE WHEN (TG_OP = 'INSERT') THEN 'INSERT'
                 WHEN (TG_OP = 'UPDATE') THEN 'UPDATE'
                 ELSE 'DELETE' END
        );
    END;
