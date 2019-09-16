mPoint = function (x, y) {
    this.x = x ? x : 0;
    this.y = y ? y : 0;
};

mVector = function (start, end) {
    this.start = start;
    this.end = end;
};

mVector.prototype = {
    //Горизонтальная составляющая
    get X() {
        return Math.abs(this.start.x - this.end.x);
    },
    //Вертикальная составляющая
    get Y() {
        return (this.start.y - this.end.y);
    }, '_translate': function (x, y) {
        this.start.x += ~~x;
        this.end.x += ~~x;
        this.start.y += ~~y;
        this.end.y += ~~y;
        return this;
    },
    "Perp": function (vector) // перпендикуляр
    {
        return new mVector(-vector.Y, vector.X);
    },
    "Dot": function (vector) // скалярное произведение
    {
        return this.X * vector.X + this.Y * vector.Y;
    },
    "Rev": function () {
        return new mVector(this.end, this.start)
    },
    "AngleX": function () {
        var hypot = Math.sqrt(Math.pow(this.start.x - this.end.x, 2) + Math.pow(this.start.y - this.end.y, 2));
        var catetX = this.end.x - this.start.x;
        //var catetY = this.end.y - this.start.y;
        var cos = catetX / hypot;
        //result.y = Math.abs(this.start.x - this.end.x)/euclidLength;
        return (Math.acos(cos) * 180) / Math.PI;
    },
    "RotAroundEnd": function (angle) {
        var rad_angle = (Math.PI / 360) * angle;
        var newX = this.end.x + (this.start.x - this.end.x) * Math.cos(rad_angle) - (this.start.y - this.end.y) * Math.sin(rad_angle);
        var newY = this.end.y + (this.start.y - this.end.y) * Math.cos(rad_angle) - (this.start.x - this.end.x) * Math.sin(rad_angle);

        return new mVector(this.end, new mPoint(newX, newY));
    },
    "RotAroundEnd180": function () {
        var rad_angle = Math.PI;
        var newX = this.end.x + (this.start.x - this.end.x) * Math.cos(rad_angle) - (this.start.y - this.end.y) * Math.sin(rad_angle);
        var newY = this.end.y + (this.start.y - this.end.y) * Math.cos(rad_angle) - (this.start.x - this.end.x) * Math.sin(rad_angle);

        return new mVector(this.end, new mPoint(newX, newY));
    },
    "Add": function (vector) {

    }
};


Geometry = {
    /**
     *
     * Вычисляет точки кривой Безье 2-го порядка в зависимости от t.
     * Кривая 2-го порядка - например парабола
     * @param bezierParams - координаты для опорных точек кривой Безье 2-го порядка
     * @return Point возвращает точку на кривой безье
     */
    "getBezierPoints": function (bezierParams, t) {
        var p1 = bezierParams[0];
        var p2 = bezierParams[1];
        var p3 = bezierParams[2];
        var px = ~~(Math.pow((1 - t), 2) * p1.x + 2 * (1 - t) * t * p2.x + Math.pow(t, 2) * p3.x);
        var py = ~~(Math.pow((1 - t), 2) * p1.y + 2 * (1 - t) * t * p2.y + Math.pow(t, 2) * p3.y);
        return new mPoint(px, py);
    },
    /**
     * Скок-поскок
     * @param function cb - iteration handler
     * @param sceneObject obj  - jumping actor
     */
    "getJumpCurve": function (cb, obj) {

        var ptY = obj.isStaying ? obj.y - 4 : obj.y + 4;
        pt1 = new mPoint(obj.x, ptY);
        pt2 = new mPoint(obj.x + 50, obj.y - 150);
        pt3 = new mPoint(obj.x + 100, ptY);
        var points = [pt1, pt2, pt3];
        var counter = 1;
        var counterStep = 0.02;
        var i = 0;
        var self = this;
        var func = function (counter, self, obj) {
            counter -= counterStep;
            if (counter > 0) {
                var pt = self.getBezierPoints(points, counter);

                var contin = cb(pt, obj);
                if (contin) {
                    setTimeout(func, 20, counter, self, obj);
                } else
                {
                    utils.log('on end jumping');
                    obj.onEndJumping();
                    return;
                }
            } else {
                obj.onEndJumping();
            }
        };
        setTimeout(func, 20, counter, self, obj);
    },
    /**
     * set of functions for axis-aligned bounding box logic
     */"getMinProjectionAxis": function (obj1, obj2) {

    },
    "getCollisionQuarters": function (obj1, obj2) {
        var centerObj1 = new mPoint(obj1.x + obj1.width / 2, obj1.y + obj1.height / 2);
        var centerObj2 = new mPoint(obj2.x + obj2.width / 2, obj2.y + obj2.height / 2);
        return centerObj1.x <= centerObj2.x ? centerObj1.y <= centerObj2.y ? 4 : 1 : centerObj1.y <= centerObj2.y ? 3 : 2;
    },
    /**
     * Возвращает вектор полуширины
     * @param sceneObject obj
     * @param int quarter
     * @param string axis
     * @returns mVector
     */
    "getHalfWidthVector": function (obj, quarter, axis) {
        var vec = new mVector();
        vec.start = new mPoint(obj.width / 2, obj.height / 2);
        if (axis === 'x') {
            if (quarter === 1 || quarter === 4) {
                vec.end = new mPoint(obj.width, vec.start.y);
            } else {
                if (quarter === 2 || quarter === 3) {
                    vec.end = new mPoint(0, vec.start.y);
                }
            }
        } else {
            if (axis === 'y') {
                if (quarter === 1 || quarter === 2) {
                    vec.end = new mPoint(vec.start.x, 0);
                } else {
                    if (quarter === 3 || quarter === 4) {
                        vec.end = new mPoint(vec.start.x, vec.start.y + obj.height / 2);
                    }
                }
            }
        }
        return vec;
    },
    "getOverlapping": function (obj1, obj2) {
        var centerX = (obj1.width / 2), centerX2 = obj2.width / 2, centerY = obj1.height / 2, centerY2 = obj2.height / 2;
        var dist = Math.sqrt(Math.pow(centerX - centerX2, 2) + Math.pow(centerY - centerY2, 2));
        var pt1 = new mPoint(centerX, centerY), pt2 = new mPoint(centerX2, centerY2), vec = new mVector(pt1, pt2);
        return dist;
    }
    ,
    "getOppositeQuarter": function (quarter) {
        return (quarter > 2) ? quarter >> 1 : (quarter << 1) + quarter % 2;
    },
    /**
     *  Находит пересечение между проекциями векторов на разделяющие оси X и Y
     * для Axis Aligned Bounding Box model
     */
    "getIntersection": function (vec1, vec2, axis, quarter) {
        var intersection = [];

        switch (quarter) {
            case 1:
                //1st quarter .*/
                if (axis === 'x') {
                    return Math.max(vec1.start.x, vec1.end.x) - Math.min(vec2.end.x, vec2.start.x);
                } else {
                    return Math.min(vec1.end.y, vec1.start.y) - Math.max(vec2.start.y, vec2.end.y);
                }
                break;
            case 2:
                //2nd quarter . Object 2 approaches from left . */
                if (axis === 'x') {
                    return Math.min(vec1.end.x, vec1.start.x) - Math.max(vec2.start.x, vec2.end.x);
                } else {

                    return Math.min(vec1.end.y, vec1.start.y) - Math.max(vec2.start.y, vec2.end.y);
                }
                break;
            case 3:
                if (axis === 'x') {
                    return Math.min(vec1.end.x, vec1.start.x) - Math.max(vec2.start.x, vec2.end.x);
                } else {

                    return Math.min(vec2.end.y, vec2.start.y) - Math.max(vec1.start.y, vec1.end.y);
                }
                break;
            case 4:
                if (axis === 'x') {
                    return Math.max(vec1.start.x, vec1.end.x) - Math.min(vec2.end.x, vec2.start.x);
                } else {
                    return Math.min(vec2.end.y, vec2.start.y) - Math.max(vec1.start.y, vec1.end.y);
                }
                break;
            default:
                console.log('Quarter not defined');
                break;
        }
    },
    /**
     * 
     * @param {type} pt1 проверяемая точка
     * @param {type} pt2 первая точка проверяемого интервала
     * @param {type} pt3 вторая точка проверяемого интервала
     * @param {type} axis ось, по которой  производится сравнение
     * @returns {unresolved}
     */
    'isPointBetween': function (pt1, pt2, pt3, axis) {
        if (axis == 'x') {
            return pt1.x <= pt2.x && pt1.x >= pt3.x || pt1.x >= pt2.x && pt1.x <= pt3.x;
        } else {
            return pt1.y <= pt2.y && pt1.y >= pt3.y || pt1.y >= pt2.y && pt1.y <= pt3.y;
        }
    }
}