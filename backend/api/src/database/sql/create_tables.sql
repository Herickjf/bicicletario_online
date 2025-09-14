CREATE TABLE IF NOT EXISTS Address(
    address_id  SERIAL,
    street      VARCHAR(300) NOT NULL,
    num         INTEGER DEFAULT NULL,
    zip_code    VARCHAR(9) NOT NULL,
    city        VARCHAR(50) NOT NULL,
    state       VARCHAR(100) NOT NULL,  

    PRIMARY KEY (address_id)
);

-- Bicicle Rack = Bicicletário
CREATE TABLE IF NOT EXISTS BikeRack(
    bike_rack_id SERIAL,
    name         VARCHAR(250) NOT NULL,
    image        TEXT DEFAULT 'default_bike_rack_img.svg',
    address_id   INTEGER,

    PRIMARY KEY (bike_rack_id),

    CONSTRAINT fk_address
        FOREIGN KEY(address_id)
        REFERENCES Address(address_id)
        ON DELETE SET NULL
);

CREATE TYPE Role AS ENUM ('owner', 'manager', 'attendant');

CREATE TABLE IF NOT EXISTS Employee(
    employee_id     SERIAL,
    name            VARCHAR(250) NOT NULL,
    login           VARCHAR(50) UNIQUE NOT NULL,
    password        VARCHAR(100) NOT NULL,
    email           VARCHAR(250) NOT NULL,
    employee_role   Role DEFAULT 'attendant',
    bike_rack_id    INTEGER NOT NULL,

    PRIMARY KEY (employee_id),

    CONSTRAINT fk_bike_rack
        FOREIGN KEY (bike_rack_id)
        REFERENCES BikeRack(bike_rack_id)
        ON DELETE CASCADE
);

CREATE TYPE BikeStatus AS ENUM ('available', 'rented', 'under_maintenance');

CREATE TABLE IF NOT EXISTS Bike(
    bike_id             SERIAL,
    model               VARCHAR(50) DEFAULT 'standart',
    year                INTEGER DEFAULT NULL,
    -- Poderia ter uma categoria (nova|seminova), mas não vejo necessidade
    image               TEXT DEFAULT 'default_bike_img.svg',
    rent_price          NUMERIC(5,2) NOT NULL,      -- por hora
    status              BikeStatus DEFAULT 'available',
    tracker_number      INTEGER NOT NULL,
    bike_rack_id        INTEGER NOT NULL,

    PRIMARY KEY (bike_id),

    CONSTRAINT fk_bike_rack
        FOREIGN KEY (bike_rack_id)
        REFERENCES BikeRack(bike_rack_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Client(
    client_id       SERIAL,
    name            VARCHAR(250) NOT NULL,
    email           VARCHAR(200) NOT NULL,
    cpf             VARCHAR(11) NOT NULL,
    phone           VARCHAR(11) NOT NULL,
    address_id      INTEGER NOT NULL,
    bike_rack_id    INTEGER NOT NULL,

    PRIMARY KEY (client_id),

    CONSTRAINT fk_address
        FOREIGN KEY (address_id)
        REFERENCES Address(address_id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_bike_rack
        FOREIGN KEY (bike_rack_id)
        REFERENCES BikeRack(bike_rack_id)
        ON DELETE CASCADE
);

CREATE TYPE RentStatus AS ENUM ('active', 'finished', 'canceled');

CREATE TABLE IF NOT EXISTS Rent(
    rent_id         SERIAL,
    rent_date       DATE DEFAULT CURRENT_DATE,
    init_time       TIME DEFAULT CURRENT_TIME,
    end_time        TIME NOT NULL,
    total_value     NUMERIC(6,2) NOT NULL,
    status          RentStatus DEFAULT 'active',

    bike_id         INTEGER,
    client_id       INTEGER,
    employee_id     INTEGER,
    bike_rack_id    INTEGER NOT NULL,

    PRIMARY KEY (rent_id),

    CONSTRAINT fk_bike
        FOREIGN KEY (bike_id)
        REFERENCES Bike(bike_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_cliente
        FOREIGN KEY (client_id)
        REFERENCES Client(client_id)
        ON DELETE SET NULL,
    
    CONSTRAINT fk_employee
        FOREIGN KEY (employee_id)
        REFERENCES Employee(employee_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_bike_rack
        FOREIGN KEY (bike_rack_id)
        REFERENCES BikeRack(bike_rack_id)
        ON DELETE CASCADE
);