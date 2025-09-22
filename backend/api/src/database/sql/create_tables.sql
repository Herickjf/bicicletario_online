-- ===========================
-- TABELA DE ENDEREÇOS
-- ===========================
CREATE TABLE IF NOT EXISTS Address(
    address_id  SERIAL,
    street      VARCHAR(300) NOT NULL,
    num         INTEGER DEFAULT NULL,
    zip_code    VARCHAR(9) NOT NULL,
    city        VARCHAR(50) NOT NULL,
    state       VARCHAR(100) NOT NULL,  
    PRIMARY KEY (address_id)
);

-- ===========================
-- BICICLETERIO
-- ===========================
CREATE TABLE IF NOT EXISTS BikeRack(
    bike_rack_id SERIAL,
    name         VARCHAR(250) NOT NULL,
    image        TEXT DEFAULT 'default_bike_rack_img.svg',
    address_id   INTEGER DEFAULT NULL,
    PRIMARY KEY (bike_rack_id),
    cnpj         VARCHAR(14) DEFAULT NULL,
    CONSTRAINT fk_address
        FOREIGN KEY(address_id)
        REFERENCES Address(address_id)
        ON DELETE SET NULL
);

-- ===========================
-- ENUMS
-- ===========================
CREATE TYPE Role AS ENUM ('owner', 'manager', 'attendant', 'customer');
CREATE TYPE BikeStatus AS ENUM ('available', 'rented', 'under_maintenance');
CREATE TYPE RentStatus AS ENUM ('active', 'finished', 'canceled');

-- ===========================
-- BICICLETA
-- ===========================
CREATE TABLE IF NOT EXISTS Bike(
    bike_id             SERIAL,
    model               VARCHAR(50) DEFAULT 'standart',
    year                INTEGER DEFAULT NULL,
    image               TEXT DEFAULT 'default_bike_img.svg',
    rent_price          NUMERIC(5,2) NOT NULL,      -- preço por hora
    status              BikeStatus DEFAULT 'available',
    tracker_number      INTEGER NOT NULL,
    bike_rack_id        INTEGER NOT NULL,
    PRIMARY KEY (bike_id),
    CONSTRAINT uq_tracker UNIQUE(tracker_number),
    CONSTRAINT fk_bike_rack
        FOREIGN KEY (bike_rack_id)
        REFERENCES BikeRack(bike_rack_id)
        ON DELETE CASCADE
);

-- ===========================
-- USUÁRIO
-- ===========================
CREATE TABLE IF NOT EXISTS Users(
    user_id       SERIAL,
    name          VARCHAR(250) NOT NULL,
    email         VARCHAR(200) NOT NULL,
    password      VARCHAR(200) NOT NULL,
    cpf           VARCHAR(11) NOT NULL,
    phone         VARCHAR(11) NOT NULL,
    address_id    INTEGER DEFAULT NULL,
    PRIMARY KEY (user_id),
    CONSTRAINT uq_email UNIQUE(email),
    CONSTRAINT uq_cpf UNIQUE(cpf),
    CONSTRAINT fk_address
        FOREIGN KEY (address_id)
        REFERENCES Address(address_id)
        ON DELETE CASCADE
);

-- ===========================
-- USER ROLE
-- ===========================
CREATE TABLE IF NOT EXISTS UsersRole(
    user_id       INTEGER NOT NULL,
    bike_rack_id  INTEGER NOT NULL,
    role          Role DEFAULT 'customer',
    PRIMARY KEY (user_id, bike_rack_id),
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_bike_rack
        FOREIGN KEY (bike_rack_id)
        REFERENCES BikeRack(bike_rack_id)
        ON DELETE CASCADE
);

-- ===========================
-- PLANO
-- ===========================
CREATE TABLE IF NOT EXISTS Plan(
    plan_id       SERIAL,
    name          VARCHAR(100) NOT NULL,
    description   TEXT DEFAULT NULL,
    price         NUMERIC(6,2) NOT NULL,       -- preço mensal
    active        BOOLEAN DEFAULT TRUE,
    bike_rack_id  INTEGER NOT NULL,
    PRIMARY KEY (plan_id),
    CONSTRAINT fk_bike_rack
        FOREIGN KEY (bike_rack_id)
        REFERENCES BikeRack(bike_rack_id)
        ON DELETE CASCADE
);

-- ===========================
-- SUBSCRIÇÃO
-- ===========================
CREATE TABLE IF NOT EXISTS Subscription(
    subscription_id SERIAL,
    start_date      DATE DEFAULT CURRENT_DATE,
    end_date        DATE DEFAULT NULL,
    active          BOOLEAN DEFAULT TRUE,
    user_id         INTEGER,
    plan_id         INTEGER,
    PRIMARY KEY (subscription_id),
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_plan
        FOREIGN KEY (plan_id)
        REFERENCES Plan(plan_id)
        ON DELETE CASCADE
);

-- ===========================
-- ALUGUEL DE BICICLETA
-- ===========================
CREATE TABLE IF NOT EXISTS Rent(
    rent_id         SERIAL,
    rent_date       DATE DEFAULT CURRENT_DATE,
    init_time       TIME DEFAULT CURRENT_TIME,
    end_time        TIME NOT NULL,
    total_value     NUMERIC(6,2) NOT NULL,
    status          RentStatus DEFAULT 'active',
    bike_id         INTEGER DEFAULT NULL,
    employee_id     INTEGER DEFAULT NULL,
    client_id       INTEGER DEFAULT NULL,
    bike_rack_id    INTEGER NOT NULL,
    PRIMARY KEY (rent_id),
    CONSTRAINT fk_bike
        FOREIGN KEY (bike_id)
        REFERENCES Bike(bike_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_employee
        FOREIGN KEY (employee_id)
        REFERENCES Users(user_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_client
        FOREIGN KEY (client_id)
        REFERENCES Users(user_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_bike_rack
        FOREIGN KEY (bike_rack_id)
        REFERENCES BikeRack(bike_rack_id)
        ON DELETE CASCADE
);

-- ===========================
-- NOTIFICAÇÃO
-- ===========================
CREATE TABLE IF NOT EXISTS Notification(
    notification_id SERIAL,
    title           VARCHAR(200) NOT NULL,
    message         TEXT NOT NULL,
    read            BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recipient_id    INTEGER NOT NULL,
    sender_id       INTEGER DEFAULT NULL,
    PRIMARY KEY (notification_id),
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_sender
        FOREIGN KEY (sender_id)
        REFERENCES Users(user_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_recipient
        FOREIGN KEY (recipient_id)
        REFERENCES Users(user_id)
        ON DELETE CASCADE
);

-- ===========================
-- Avaliacoes
-- ===========================
CREATE TABLE IF NOT EXISTS Review(
    review_id       SERIAL,
    rating          INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment         TEXT DEFAULT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id         INTEGER NOT NULL,
    bike_rack_id    INTEGER NOT NULL,
    PRIMARY KEY (review_id),
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_bike_rack
        FOREIGN KEY (bike_rack_id)
        REFERENCES BikeRack(bike_rack_id)
        ON DELETE CASCADE
);