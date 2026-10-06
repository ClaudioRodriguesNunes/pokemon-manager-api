-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "pokemons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "hp" INTEGER NOT NULL,
    "attack" INTEGER NOT NULL,
    "defense" INTEGER NOT NULL,
    "spriteUrl" TEXT,
    "baseExperience" INTEGER,
    "height" INTEGER,
    "weight" INTEGER,

    CONSTRAINT "pokemons_pkey" PRIMARY KEY ("id")
);
