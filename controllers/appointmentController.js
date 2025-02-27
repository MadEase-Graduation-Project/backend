import user from "../models/userModel.js";
import Appointment from "../models/appointmentModel.js";

export const store = async (req, res) => {
	try {
		const patientId = req.user._id;
		const patient = await user.findById(patientId);
		// const doctorId = req.body.doctorId;
		const doctorId = req.params.id;
		const role = req.user.role;

		if (role !== "admin" && role !== "hospital") {
			const { nurseId, priority, appointmentDate } = req.body;
			const appoint = new Appointment({
				patientId,
				nurseId,
				doctorId,
				priority,
				appointmentDate,
				name: patient.name, 
			});
			const savedAppointment = await appoint.save();
			const doctor = await user.findById(doctorId);
			const userId = appoint.patientId;
			if (!doctor) {
				console.error(`doctor not found with id ${doctorId}`);
				return res
					.status(404)
					.json({ success: false, message: "Tour not found" });
			}
			await doctor.updateOne({
				$addToSet :{appointments:{$each:[savedAppointment]}}
				//$push: { appointments: savedAppointment._id },
			});
			await user.findByIdAndUpdate(
				{ _id: userId },
				{  $addToSet :{appointments:{$each:[savedAppointment]}} }
			);

			res.status(200).json({
				message: "Appointment booked successfully",
				appointment: savedAppointment,
			});
		} else {
			res.status(403).send("Access Denied");
		}
	} catch (error) {
		console.error("Error booking appointment:", error);
		res.status(400).send({
			message: "An error occurred while booking the appointment",
			error: error.message,
		});
	}
};
export const deleteAppointUser = async (req, res) => {
	const role = req.user.role;
	const userId = req.user._id;
	if (role == "admin" || role == "patient") {
		try {
			const appointment = await Appointment.findById(req.params.id);
			if (!appointment) {
				return res.status(404).json({ message: "Appointment not found" });
			}

			await Appointment.findByIdAndDelete(req.params.id);
			await user.findByIdAndUpdate(
				{ _id: userId },
				{ $pull: { appointments: appointment } },
				{ new: true }
			);
			res.json({ message: "book deleted", data: [] });
		} catch (error) {
			console.error("Error deleting appointment:", error);
			res.status(500).json({
				message: "An error occurred while deleting the appointment",
				error: error.message,
			});
		}
	} else {
		res.status(403).json({
			message: "You do not have permission to delete this appointment",
		});
	}
};
export const deleteAppointDoctor = async (req, res) => {
	const role = req.user.role;
	const doctorId = req.user._id;

	if (role === "admin" || role === "nurse" || role === "doctor") {
		try {
			const appointment = await Appointment.findById(req.params.id);
			if (!appointment) {
				return res.status(404).json({ message: "Appointment not found" });
			}

			// Delete the appointment
			await Appointment.findByIdAndDelete(req.params.id);

			// Remove the appointment from the doctor's record
			await user.findByIdAndUpdate(
				doctorId,
				{ $pull: { appointments: { appointmentId: appointment._id } } },
				{ new: true }
			);

			// Update the status of the appointment in the patient's record
			await user.findByIdAndUpdate(
				appointment.patientId,
				{ $set: { "appointments.$[elem].status": "deleted" } },
				{
					arrayFilters: [{ "elem.appointmentId": appointment._id }],
					new: true,
				}
			);

			res.json({ message: "Appointment deleted successfully", data: [] });
		} catch (error) {
			console.error("Error deleting appointment:", error);
			res.status(500).json({
				message: "An error occurred while deleting the appointment",
				error: error.message,
			});
		}
	} else {
		res.status(403).json({
			message: "You do not have permission to delete this appointment",
		});
	}
};

export const update = async (req, res) => {
	const role = req.user.role;
	const userId = req.user._id;
	if (role == "patient") {
		try {
			const appointmentId = req.params.id;
			const newAppointment = req.body;
			await Appointment.findByIdAndUpdate(appointmentId, newAppointment);
			await user.findByIdAndUpdate(
				userId,
				{ $addToSet: { appointments: newAppointment._id } } // Use $addToSet to avoid duplicates
			);
			res.json({ message: "book update", data: newAppointment });
		} catch (error) {
			console.error("Error updating appointment:", error);
			res.status(500).json({
				message: "An error occurred while updating the appointment",
				error: error.message,
			});
		}
	} else {
		res.status(403).send("Access Denied");
	}
};
export const index = async (req, res) => {
	const role = req.user.role;
	if (role == "nurse" || role == "doctor") {
		try {
			const appointments = await Appointment.find();
			res.json({ message: "Appointments", data: appointments });
		} catch (error) {
			console.error("Error updating appointment:", error);
			res.status(500).json({
				message: "An error occurred while updating the appointment",
				error: error.message,
			});
		}
	} else {
		res.status(403).send("Access Denied");
	}
};
export const show = async (req, res) => {
	const id = req.params.id;
	try {
		const booking = await Appointment.findById(id);
		res.status(200).json({ message: " successful", data: booking });
	} catch (error) {
		res.status(400).json({ success: false, message: "failed" });
	}
};
