import fastify from "fastify";
import { supabase } from "./supabaseConnection";

const app = fastify();

type Animal = {
  id: number;
  name: string;
  cientific_name: string;
  description: string;
  images: string[];
  country: string;
}

app.get("/animals", async () => {
  try{
    const { data: animals } = await supabase.from("animals").select("*");
     
    return {"value": animals};
  } catch (error) {
    console.log('Error: ', error);
    throw error;
  }
});

app.get("/animals/:id", async (request, response) => {
  try {
    const { id } = request.params as { id: string };
    const { data: animal, error } = await supabase.from("animals").select("*").eq("id", id); 

    if (!id) {
      return response.status(400).send({ error: "ID is required" });
    }
    if (error) {
      return response.status(400).send({ error: error.message });
    }
    if (!animal || animal.length === 0) {
      return response.status(404).send({ error: "Animal not found for this ID" });
    }

    return response.send({ animal: animal });
  } catch (error) {
    console.log('Error: ', error);
    return response.status(500).send({ error: "Internal server error" });
  }
});

app.post("/animals", async (request, response) => {
  try {
    const { id, name, cientific_name, description, images, country } = request.body as Animal;
    const { data: createdAnimal, error } = await supabase
      .from("animals")
      .insert({ id, name, cientific_name, description, images, country })
      .select();

    if (error) {
      return response.status(400).send({ error: error.message });
    }

    if (!createdAnimal || createdAnimal.length === 0) {
      return response.status(500).send({ error: "Failed to create animal" });
    }

    return response.status(201).send({ 
      message: "Animal created successfully",
      value: createdAnimal[0]
    });
  } catch (error) {
    console.log('Error: ', error);
    return response.status(500).send({ error: "Internal server error" });
  }
});

app.put("/animals/:id", async (request, response) => {
  try {
    const { id } = request.params as { id: string };
    const { data: updatedAnimal, error } = await supabase.from("animals").update(request.body).eq("id", id).select(); 

    if (error) {
      return response.status(400).send({ error: error.message });
    }

    return response.status(200).send({ message: "Animal updated successfully", value: updatedAnimal[0] });
  } catch (error) {
    console.log('Error: ', error);
    return response.status(500).send({ error: "Internal server error" });
  }
});

app.delete("/animals/:id", async (request, response) => {
  try {
    const { id } = request.params as { id: string };
    const { data: deletedAnimal, error } = await supabase.from("animals").delete().eq("id", id).select();

    if (error) {
      return response.status(400).send({ error: error.message });
    }

    return response.status(200).send({ message: "Animal deleted successfully", value: deletedAnimal[0] });
  } catch (error) {
    console.log('Error: ', error);
    return response.status(500).send({ error: "Internal server error" });
  }
});

app.listen({ 
  host: '0.0.0.0',
  port: process.env.PORT ? parseInt(process.env.PORT) : 3333,
}, () => {
  console.log(`Server is running on port ${process.env.PORT} 🐸`);
});

