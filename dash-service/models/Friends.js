export const FriendsMod = (sequelize, DataTypes) => {

    const Friends = sequelize.define(
        'Friends',
        {
            id:{type :DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            status:
            {
                type: DataTypes.ENUM('friends', 'blocked', 'pending'),
                defaultValue: 'pending',
                allowNull: false,
            },
        },
        {
            freezeTableName:true,
        })
    return Friends
    
}