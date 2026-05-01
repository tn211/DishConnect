import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../../supabaseClient";
import Layout from "../../components/layout-components/Layout";
import { useNavigate } from "react-router-dom";

const RecipeEntryPage = ({ session }) => {
  const { register, handleSubmit } = useForm();
  const [submitting, setSubmitting] = useState(false);
  const [ingredients, setIngredients] = useState([
    { name: "", quantity: "", unit: "" },
  ]);
  const [steps, setSteps] = useState([{ instruction: "" }]);
  const [prepTime, setPrepTime] = useState({ hours: 0, minutes: 0 });
  const [cookTime, setCookTime] = useState({ hours: 0, minutes: 0 });
  const navigate = useNavigate();

  const addIngredientField = () => {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "" }]);
  };

  const removeIngredientField = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addStepField = () => {
    setSteps([...steps, { instruction: "" }]);
  };

  const removeStepField = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    setSubmitting(true);

    const totalPrepTime =
      parseInt(prepTime.hours) * 60 + parseInt(prepTime.minutes);
    const totalCookTime =
      parseInt(cookTime.hours) * 60 + parseInt(cookTime.minutes);

    try {
      // Handle image upload
      if (data.image.length > 0) {
        const file = data.image[0];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("recipe-images")
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        data.image_url = filePath; // Save image path for further reference in the recipe
      }

      // Insert the recipe and retrieve the recipe ID
      const { data: recipeData, error: recipeError } = await supabase
        .from("recipes")
        .insert({
          title: data.title,
          description: data.description,
          prep_time: totalPrepTime,
          cook_time: totalCookTime,
          profile_id: session.user.id,
          created_at: new Date().toISOString(),
          image_url: data.image_url,
        })
        .select()
        .single();

      if (recipeError) throw recipeError;

      const recipeId = recipeData.recipe_id;

      // Insert ingredients using the retrieved recipe ID
      for (const ingredient of data.ingredients) {
        const { error: ingredientError } = await supabase
          .from("ingredients")
          .insert({
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            recipe_id: recipeId,
            profile_id: session.user.id,
          });

        if (ingredientError) throw ingredientError;
      }

      // Insert steps using the retrieved recipe ID
      let stepNumber = 1;
      for (const step of data.steps) {
        const { error: stepError } = await supabase.from("steps").insert({
          instruction: step.instruction,
          recipe_id: recipeId,
          step_number: stepNumber++, // Increment step_number for each step
        });

        if (stepError) throw stepError;
      }

      // Redirect to the RecipeDetail page for the newly added recipe
      navigate(`/recipes/${recipeId}`);
    } catch (error) {
      console.error("Submission error:", error);
      alert(`Submission error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full bg-[#0f0f0f] border border-white/15 rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-fuchsia-500/60 transition-colors";
  const labelCls =
    "block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5";
  const btnSecondary =
    "text-xs px-3 py-1.5 rounded-lg border border-white/15 text-neutral-400 hover:text-white hover:border-white/30 bg-transparent transition-colors";

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-[#0f0f0f] px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-semibold text-white mb-1 tracking-tight">
            Upload Recipe
          </h1>
          <p className="text-neutral-500 text-sm mb-8">
            Share your dish with the community.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 flex flex-col gap-5"
          >
            <div>
              <label className={labelCls}>Title</label>
              <input
                type="text"
                {...register("title", { required: true })}
                className={inputCls}
                placeholder="Recipe name"
              />
            </div>

            <div>
              <label className={labelCls}>Recipe Image</label>
              <input
                type="file"
                {...register("image", { required: true })}
                id="image"
                className="w-full text-sm text-neutral-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-white/15 file:text-xs file:text-neutral-300 file:bg-transparent file:cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Prep Time</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={prepTime.hours}
                    onChange={(e) =>
                      setPrepTime({ ...prepTime, hours: e.target.value })
                    }
                    className={inputCls}
                    placeholder="hrs"
                  />
                  <input
                    type="number"
                    value={prepTime.minutes}
                    onChange={(e) =>
                      setPrepTime({ ...prepTime, minutes: e.target.value })
                    }
                    className={inputCls}
                    placeholder="min"
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Cook Time</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={cookTime.hours}
                    onChange={(e) =>
                      setCookTime({ ...cookTime, hours: e.target.value })
                    }
                    className={inputCls}
                    placeholder="hrs"
                  />
                  <input
                    type="number"
                    value={cookTime.minutes}
                    onChange={(e) =>
                      setCookTime({ ...cookTime, minutes: e.target.value })
                    }
                    className={inputCls}
                    placeholder="min"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea
                {...register("description", { required: true })}
                className={`${inputCls} h-20 resize-none`}
                placeholder="Describe your recipe…"
              />
            </div>

            <div>
              <label className={labelCls}>Steps</label>
              <div className="flex flex-col gap-2 mb-2">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <span className="text-fuchsia-400 text-sm font-medium pt-2.5 shrink-0">
                      {index + 1}.
                    </span>
                    <textarea
                      {...register(`steps[${index}].instruction`, {
                        required: true,
                      })}
                      placeholder="Describe this step…"
                      className={`${inputCls} h-16 resize-none flex-1`}
                    />
                    <button
                      type="button"
                      onClick={() => removeStepField(index)}
                      className="text-neutral-600 hover:text-red-400 pt-2.5 bg-transparent border-0 text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addStepField}
                className={btnSecondary}
              >
                + Add Step
              </button>
            </div>

            <div>
              <label className={labelCls}>Ingredients</label>
              <div className="flex flex-col gap-2 mb-2">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      {...register(`ingredients[${index}].name`, {
                        required: true,
                      })}
                      placeholder="Name"
                      className={`${inputCls} flex-1`}
                    />
                    <input
                      {...register(`ingredients[${index}].quantity`, {
                        required: "Quantity is required",
                        valueAsNumber: true,
                        validate: {
                          isFloat: (value) =>
                            !isNaN(value) && Number(value) === value,
                        },
                      })}
                      type="number"
                      step="0.01"
                      placeholder="Qty"
                      className={`${inputCls} w-20`}
                    />
                    <select
                      {...register(`ingredients[${index}].unit`, {
                        required: true,
                      })}
                      className={`${inputCls} w-24`}
                    >
                      <option value="">Unit</option>
                      <option value="whole">whole</option>
                      <option value="tsp">tsp</option>
                      <option value="tbsp">tbsp</option>
                      <option value="pinch">pinch</option>
                      <option value="g">g</option>
                      <option value="mL">mL</option>
                      <option value="L">L</option>
                      <option value="oz">oz</option>
                      <option value="lb">lb</option>
                      <option value="cups">cups</option>
                      <option value="pints">pints</option>
                      <option value="quarts">quarts</option>
                      <option value="gallons">gallons</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeIngredientField(index)}
                      className="text-neutral-600 hover:text-red-400 bg-transparent border-0 text-lg leading-none shrink-0"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addIngredientField}
                className={btnSecondary}
              >
                + Add Ingredient
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-fuchsia-500 hover:bg-fuchsia-400 disabled:bg-fuchsia-500/40 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-colors border-0 mt-2"
            >
              {submitting ? "Submitting…" : "Submit Recipe"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default RecipeEntryPage;
