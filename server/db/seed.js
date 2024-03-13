// Clear and repopulate the database.

const db = require("../db");
const { faker } = require("@faker-js/faker");

async function seed() {
  console.log("Seeding the database.");
  try {
    // Clear the database.
    await db.query(
      "DROP TABLE IF EXISTS recipe_category, category, recipe, user;"
    );

    // Recreate the tables
    await db.query(`
      CREATE TABLE user (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
      CREATE TABLE recipe (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        ingredients TEXT[],
        instructions TEXT[],
        userId INTEGER NOT NULL REFERENCES user(id) ON DELETE CASCADE
      );

      CREATE TABLE category (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
        );

        CREATE TABLE recipe_category (
          recipe_id INTEGER REFERENCES recipe(id) ON DELETE CASCADE,
          category_id INTEGER REFERENCES category(id) ON DELETE CASCADE,
          PRIMARY KEY (recipe_id, category_id)
        );
    `);

    // Add categories

    const categories = [
      "Poultry",
      "Beef",
      "Fish",
      "Pork",
      "Vegetables",
      "Sauces",
      "Vegetarian",
      "Pasta",
      "Appetizers",
      "Dessert",
      "Breakfast",
      "Brunch",
      "Salad",
      "Soups",
      "Sandwiches",
    ];

    // Insert categories into the category table
    await Promise.all(
      categories.map(async (categoryName) => {
        await db.query(`INSERT INTO category (name) VALUES ($1);`, [
          categoryName,
        ]);
      })
    );

    // Add 5 users.
    await Promise.all(
      [...Array(5)].map(() =>
        db.query(`INSERT INTO user (username, password) VALUES ($1, $2);`, [
          faker.internet.userName(),
          faker.internet.password(),
        ])
      )
    );

    // Add recipes and associate them with random categories
    await Promise.all(
      [...Array(20)].map(async (_, i) => {
        const userId = faker.random.number({ min: 1, max: 5 });
        const categoryId = faker.random.number({
          min: 1,
          max: categories.length,
        });
        await db.query(
          `INSERT INTO recipe (title, ingredients, instructions, userId) VALUES ($1, $2, $3, $4);`,
          [
            faker.lorem.sentence(),
            faker.lorem.paragraphs(3),
            faker.lorem.paragraphs(5),
            userId,
          ]
        );
        const recipeId = (await db.query(`SELECT lastval();`)).rows[0].lastval;
        await db.query(
          `INSERT INTO recipe_category (recipe_id, category_id) VALUES ($1, $2);`,
          [recipeId, categoryId]
        );
      })
    );

    console.log("Database is seeded.");
  } catch (err) {
    console.error(err);
  }
}

// Seed the database if we are running this file directly.
if (require.main === module) {
  seed();
}

module.exports = seed;
