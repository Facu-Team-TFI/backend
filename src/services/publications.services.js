import models from "../models/index.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";
import {
  getPublicIdFromCloudinaryUrl,
  isCloudinaryUrl,
} from "../utils/cloudinaryPublicId.js";
import cloudinary from "../config/cloudinary.js";

const { Publications, Category, SubCategory, City, Province, Sellers, Buyers } =
  models;

export const getAll = async () => {
  return Publications.findAll({
    include: [
      {
        model: Category,
        attributes: ["ID_Category", "CategoryName"],
      },
      {
        model: SubCategory,
        attributes: ["ID_SubCategory", "NameSubCategory"],
      },
      {
        model: City,
        as: "City",
        attributes: ["ID_City", "Name"],
        include: {
          model: Province,
          as: "Province",
          attributes: ["ID_Province", "Name"],
        },
      },
    ],
  });
};

export const getAllPaginated = async (page = 1, limit = 5) => {
  const offset = (page - 1) * limit;

  const result = await Publications.findAndCountAll({
    limit: Number(limit),
    offset,
    include: [
      {
        model: Category,
        attributes: ["ID_Category", "CategoryName"],
      },
      {
        model: SubCategory,
        attributes: ["ID_SubCategory", "NameSubCategory"],
      },
      {
        model: City,
        as: "City",
        attributes: ["ID_City", "Name"],
        include: {
          model: Province,
          as: "Province",
          attributes: ["ID_Province", "Name"],
        },
      },
    ],
  });

  return {
    rows: result.rows,
    totalPages: Math.ceil(result.count / limit),
    totalItems: result.count,
    currentPage: Number(page),
  };
};


export const getSellerByPublicationId = async (publicationId) => {
  const publication = await Publications.findByPk(publicationId, {
    include: {
      model: Sellers,
      as: "Seller",
      attributes: ["ID_Sellers"],
      include: {
        model: Buyers,
        as: "Buyer",
        attributes: [
          "ID_Buyers",
          "avatarUrl",
          "BuyersName",
          "BuyersLastName",
          "NickName",
          "Email",
          "Phone",
        ],
        include: {
          model: City,
          as: "City",
          attributes: ["ID_City", "Name"],
          include: {
            model: Province,
            as: "Province",
            attributes: ["ID_Province", "Name"],
          },
        },
      },
    },
  });

  return publication?.Seller || null;
};

export const getById = async (id) => Publications.findByPk(id);

export const createPublication = async (req, res) => {
  try {
    const {
      name,
      brand,
      price,
      condition,
      categoryId,
      subCategoryId,
      description,
      cityId,
      sellerId,
    } = req.body;

    let imageUrl = null;

    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer, {
        folder: "publications",
      });
      imageUrl = result.secure_url;
    }

    const newPublication = await Publications.create({
      Title: name,
      Brand: brand,
      Price: price,
      State: condition,
      ID_Category: categoryId,
      ID_SubCategory: subCategoryId,
      DescriptionProduct: description,
      ImageUrl: imageUrl,
      ID_City: cityId,
      ID_Sellers: sellerId,
    });

    return res.status(201).json(newPublication);
  } catch (error) {
    console.error("Error al crear la publicación:", error);
    return res.status(500).json({ error: "Error al crear la publicación" });
  }
};

export const update = async (id, data) => {
  const pub = await Publications.findByPk(id);
  if (!pub) return null;
  return await pub.update(data);
};

export const remove = async (id) => {
  const pub = await Publications.findByPk(id);
  if (!pub) return null;
  await pub.destroy();
  return pub;
};

export const getLatest = async (limit = 5) => {
  return await Publications.findAll({
    order: [["created_at", "DESC"]],
    limit,
    include: [
      {
        model: Category,
        attributes: ["ID_Category", "CategoryName"],
      },
      {
        model: SubCategory,
        attributes: ["ID_SubCategory", "NameSubCategory"],
      },
      {
        model: City,
        as: "City",
        attributes: ["ID_City", "Name"],
        include: {
          model: Province,
          as: "Province",
          attributes: ["ID_Province", "Name"],
        },
      },
    ],
  });
};

export const updatePublication = async (req, res) => {
  const { id } = req.params;

  try {
    // 1) Cargar la publicación actual para conocer la URL previa
    const current = await Publications.findByPk(id);
    if (!current) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    const body = req.body || {};
    const updatePayload = {};

    // 2) Lista blanca de campos a actualizar
    const allow = [
      "Title",
      "Brand",
      "State",
      "DescriptionProduct",
      "Sku",
      "ID_Category",
      "ID_SubCategory",
      "ID_City",
      "ID_Sellers",
    ];
    for (const k of allow) {
      if (body[k] !== undefined && body[k] !== "") {
        updatePayload[k] = body[k];
      }
    }

    // 3) Price -> número
    if (body.Price !== undefined && body.Price !== "") {
      const n = parseFloat(body.Price);
      if (!Number.isNaN(n)) updatePayload.Price = n;
    }

    // (Opcional) IDs -> número
    const idKeys = ["ID_Category", "ID_SubCategory", "ID_City", "ID_Sellers"];
    for (const key of idKeys) {
      if (updatePayload[key] !== undefined) {
        const n = Number(updatePayload[key]);
        if (!Number.isNaN(n)) updatePayload[key] = n;
      }
    }

    // 4) Si viene un archivo en 'Image', subir a Cloudinary
    let newUpload = null;
    if (req.file) {
      newUpload = await uploadBufferToCloudinary(req.file.buffer, {
        folder: "uploads/publications",
        resource_type: "image",
      });
      updatePayload.ImageUrl = newUpload.secure_url;
    } else if (body.ImageUrl) {
      // Si no subís archivo pero querés setear explícitamente la URL
      updatePayload.ImageUrl = body.ImageUrl;
    }

    // 5) Actualizar en DB
    const [updatedCount] = await Publications.update(updatePayload, {
      where: { ID_Publication: id },
    });

    if (!updatedCount) {
      // Si la actualización falló y subimos imagen nueva, intentamos borrarla para no dejar huérfanos
      if (newUpload?.public_id) {
        try {
          await cloudinary.uploader.destroy(newUpload.public_id, {
            resource_type: "image",
            invalidate: true,
          });
        } catch (e) {
          console.error(
            "No se pudo eliminar la imagen NUEVA tras fallo de update:",
            e,
          );
        }
      }
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    // 6) Best-effort: si subiste imagen nueva, intentar borrar la anterior
    if (newUpload) {
      const cloudName = cloudinary.config().cloud_name;
      const oldUrl = current.ImageUrl;

      if (oldUrl && isCloudinaryUrl(oldUrl, cloudName)) {
        const oldPublicId = getPublicIdFromCloudinaryUrl(oldUrl);
        // Evitar borrar si casualmente el public_id coincide con el nuevo
        if (oldPublicId && oldPublicId !== newUpload.public_id) {
          try {
            await cloudinary.uploader.destroy(oldPublicId, {
              resource_type: "image",
              invalidate: true, // limpia la caché CDN
            });
          } catch (destroyErr) {
            console.error(
              "No se pudo eliminar la imagen ANTERIOR de Cloudinary:",
              destroyErr,
            );
          }
        }
      }
    }

    // 7) Responder con la publicación actualizada
    const updatedPost = await Publications.findByPk(id);
    return res.json(updatedPost);
  } catch (err) {
    console.error("Error al actualizar publicación:", err);

    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "La imagen excede el tamaño permitido" });
    }
    if (err.name === "MulterError") {
      return res
        .status(400)
        .json({ message: "Error de carga de archivo", error: err.message });
    }

    return res
      .status(500)
      .json({ message: "Error al actualizar", error: err.message });
  }
};
