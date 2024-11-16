const Report = require('../models/Report');

// Tạo báo cáo mới
exports.createReport = async (req, res) => {
    try {
        const newReport = new Report(req.body);
        const savedReport = await newReport.save();
        res.status(200).json(savedReport);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Lấy tất cả báo cáo
exports.getReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate("id_user", "username email phone avatar")
            .populate({
                path: "id_post",
                select: "title description price averageRating views location",
                populate: {
                    path: "location",
                    select: "address city district ward"
                }
            });
        res.status(200).json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lấy báo cáo theo ID
exports.getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate("id_user", "username email phone avatar")
            .populate({
                path: "id_post",
                select: "title roomType price averageRating views location",
                populate: {
                    path: "location",
                    select: "address city district ward"
                }
            });
        if (!report) {
            return res.status(404).json({ msg: 'Report not found' });
        }
        res.status(200).json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Cập nhật báo cáo
exports.updateReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ msg: 'Report not found' });
        }

        const { report_reason, description, status } = req.body;
        if (report_reason) report.report_reason = report_reason;
        if (description) report.description = description;
        if (status) report.status = status;

        const updatedReport = await report.save();
        res.status(200).json(updatedReport);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Cập nhật trạng thái báo cáo thành "Processing"
exports.updateReportStatusToProcessing = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ msg: 'Report not found' });
        }

        report.status = 'Processing';
        const updatedReport = await report.save();
        res.status(200).json(updatedReport);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Cập nhật trạng thái báo cáo thành "Resolved"
exports.updateReportStatusToResolved = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ msg: 'Report not found' });
        }

        report.status = 'Resolved';
        const updatedReport = await report.save();
        res.status(200).json(updatedReport);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Xóa báo cáo
exports.deleteReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ msg: 'Report not found' });
        }

        await report.deleteOne();
        res.status(200).json({ msg: 'Report deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

