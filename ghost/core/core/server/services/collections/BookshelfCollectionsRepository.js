const Collection = require('@tryghost/collections').Collection;
/**
 * @typedef {import('@tryghost/collections/src/CollectionRepository')} CollectionRepository
 */

/**
 * @implements {CollectionRepository}
 */
module.exports = class BookshelfCollectionsRepository {
    #model;
    constructor(model) {
        this.#model = model;
    }

    /**
     * @param {string} id
     * @returns {Promise<Collection>}
     */
    async getById(id) {
        console.log('getById');
        const model = await this.#model.findOne({id}, {require: false, withRelated: ['posts']});
        if (!model) {
            return null;
        }
        return this.#modelToCollection(model);
    }

    /**
     * @param {string} slug
     * @returns {Promise<Collection>}
     */
    async getBySlug(slug) {
        console.log('getBySlug');
        const model = await this.#model.findOne({slug}, {require: false, withRelated: ['posts']});
        if (!model) {
            return null;
        }
        return this.#modelToCollection(model);
    }

    /**
     * @param {object} [options]
     * @param {string} [options.filter]
     * @param {string} [options.order]
     */
    async getAll(options = {}) {
        console.log('getAll');
        const models = await this.#model.findAll({...options, withRelated: ['posts']});
        return await Promise.all(models.map(model => this.#modelToCollection(model)));
    }

    #modelToCollection(model) {
        const json = model.toJSON();

        return Collection.create({
            id: json.id,
            slug: json.slug,
            title: json.title,
            description: json.description,
            filter: json.filter,
            type: json.type,
            featureImage: json.feature_image,
            posts: json.posts.map(post => post.id),
            createdAt: json.created_at,
            updatedAt: json.updated_at
        });
    }

    /**
     * @param {Collection} collection
     * @returns {Promise<void>}
     */
    async save(collection) {
        console.log('save');
        const data = {
            id: collection.id,
            slug: collection.slug,
            title: collection.title,
            description: collection.description,
            filter: collection.filter,
            type: collection.type,
            feature_image: collection.featureImage || null,
            posts: collection.posts.map(postId => ({id: postId})),
            created_at: collection.createdAt,
            updated_at: collection.updatedAt
        };

        console.log(data);

        const existing = await this.#model.findOne({id: data.id}, {require: false});

        if (!existing) {
            await this.#model.add(data);
        } else {
            await this.#model.edit(data, {
                id: data.id
            });
        }
    }
};
