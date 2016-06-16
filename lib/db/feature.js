var eventType       = require('../eventType');
var logger          = require('../logger');
var NotFoundError   = require('../error/NotFoundError');
var FEATURE_COLUMNS = ['name', 'description', 'enabled', 'strategy_name', 'parameters'];

module.exports = function(db, eventStore) {
    eventStore.on(eventType.featureCreated, function (event) {
        return createFeature(event.data);
    });

    eventStore.on(eventType.featureUpdated, function (event) {
        return updateFeature(event.data);
    });

    eventStore.on(eventType.featureArchived, function (event) {
        return archiveFeature(event.data);
    });

    eventStore.on(eventType.featureRevived, function (event) {
        return reviveFeature(event.data);
    });

    function getFeatures() {
        return db
            .select(FEATURE_COLUMNS)
            .from('features')
            .where({ archived: 0 })
            .orderBy('name', 'asc')
            .map(rowToFeature);
    }

    function getFeature(name) {
        return db
            .first(FEATURE_COLUMNS)
            .from('features')
            .where({ name: name })
            .then(rowToFeature);
    }

    function getArchivedFeatures() {
        return db
            .select(FEATURE_COLUMNS)
            .from('features')
            .where({ archived: 1 })
            .orderBy('name', 'asc')
            .map(rowToFeature);
    }


    function rowToFeature(row) {
        if (!row) {
            throw new NotFoundError('No feature toggle found');
        }

        return {
            name: row.name,
            description: row.description,
            enabled: row.enabled > 0,
            strategy: row.strategy_name, // eslint-disable-line
            parameters: row.parameters
        };
    }

    function eventDataToRow(data) {
        return {
            name: data.name,
            description: data.description,
            enabled: data.enabled ? 1 : 0,
            archived: data.archived ? 1 :0,
            strategy_name: data.strategy, // eslint-disable-line
            parameters: data.parameters
        };
    }

    function createFeature(data) {
        return db('features')
            .insert(eventDataToRow(data))
            .catch(function (err) {
                logger.error('Could not insert feature, error was: ', err);
            });
    }

    function updateFeature(data) {
        return db('features')
            .where({ name: data.name })
            .update(eventDataToRow(data))
            .catch(function (err) {
                logger.error('Could not update feature, error was: ', err);
            });
    }

    function archiveFeature(data) {
        return db('features')
            .where({ name: data.name })
            .update({ archived: 1 })
            .catch(function (err) {
                logger.error('Could not archive feature, error was: ', err);
            });
    }

    function reviveFeature(data) {
        return db('features')
            .where({ name: data.name })
            .update({ archived: 0, enabled: 0 })
            .catch(function (err) {
                logger.error('Could not archive feature, error was: ', err);
            });
    }


    return {
        getFeatures: getFeatures,
        getFeature: getFeature,
        getArchivedFeatures: getArchivedFeatures,
        _createFeature: createFeature, // visible for testing
        _updateFeature: updateFeature  // visible for testing
    };
};