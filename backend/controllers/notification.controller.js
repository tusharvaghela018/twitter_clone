import Notification from "../models/notification.model.js";


//get all notifications
export const getNotifications = async(req,res) => {
    try {
        
        const userId = req.user._id;

        const notifications = await Notification.find({ to : userId})
        .populate(
            {
                path : "from",
                select : "username profileImg"
            }
        )

        await Notification.updateMany({to : userId}, {read : true})

        res.status(200).json(notifications)
    } catch (error) {
        
        console.log(`ERR : error while getNotifications, ERROR : ${error.message}`)

        return res.status(500).json(
            {
                success : false,
                error : "error while getNotifications",
                errorMessage : error.message
            }
        )
    }
}

//delete notifications
export const deleteNotifications = async(req,res) => {
    try {
        
        const userId = req.user._id

        await Notification.deleteMany({to : userId})

        res.status(200).json(
            {
                message : "notification deleted successfully"
            }
        )
    } catch (error) {

        console.log(`ERR : error while deleteNotifications, ERROR : ${error.message}`)

        return res.status(500).json(
            {
                success : false,
                error : "error while deleteNotifications",
                errorMessage : error.message
            }
        )
    }
}

//delete one notification

export const deleteOneNotification = async(req,res) => {
    try {

        const notificationId = req.params.id;

        const userId = req.user._id

        if(!notification){
            return res.status(404).json(
                {
                    error : "Notification not found"
                }
            )
        }

        const notification = await Notification.findById(notificationId)

        if(notification.to.toString() !== userId.toString()){
            return res.status(403).json(
                {
                    success : false,
                    error : "You are not allowed to delete this notification"
                }
            )
        }

        await Notification.findByIdAndDelete(notificationId)

        res.status(200).json(
            {
                success : true,
                message : "Notification deleted successfully."
            }
        )
    } catch (error) {
        
        console.log(`ERR : error while deleteOneNotifications, ERROR : ${error.message}`)

        return res.status(500).json(
            {
                success : false,
                error : "error while deleteOneNotifications",
                errorMessage : error.message
            }
        )
    }
}